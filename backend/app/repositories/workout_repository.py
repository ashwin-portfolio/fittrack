from __future__ import annotations

import uuid
from datetime import date

from sqlalchemy import func, select  # noqa: F401
from sqlalchemy.orm import Session, selectinload

from app.models.workout import ExerciseSet, WorkoutExercise, WorkoutSession


def _with_detail():
    """Eager-load options for full nested response."""
    return [
        selectinload(WorkoutSession.workout_exercises)
        .selectinload(WorkoutExercise.exercise),
        selectinload(WorkoutSession.workout_exercises)
        .selectinload(WorkoutExercise.sets),
    ]


class WorkoutRepository:
    def create_session(
        self,
        db: Session,
        *,
        user_id: uuid.UUID,
        session_date: date,
        name: str | None,
        notes: str | None,
        is_shared: bool,
    ) -> WorkoutSession:
        session = WorkoutSession(
            user_id=user_id,
            session_date=session_date,
            name=name,
            notes=notes,
            is_shared=is_shared,
        )
        db.add(session)
        db.flush()
        return session

    def add_exercise(
        self,
        db: Session,
        *,
        session_id: uuid.UUID,
        exercise_id: uuid.UUID,
        order_index: int,
    ) -> WorkoutExercise:
        we = WorkoutExercise(
            session_id=session_id,
            exercise_id=exercise_id,
            order_index=order_index,
        )
        db.add(we)
        db.flush()
        return we

    def add_set(
        self,
        db: Session,
        *,
        workout_exercise_id: uuid.UUID,
        set_number: int,
        reps: int,
        weight_kg: float,
    ) -> ExerciseSet:
        s = ExerciseSet(
            workout_exercise_id=workout_exercise_id,
            set_number=set_number,
            reps=reps,
            weight_kg=weight_kg,
        )
        db.add(s)
        db.flush()
        return s

    def list_for_user(
        self,
        db: Session,
        user_id: uuid.UUID,
        *,
        limit: int = 20,
        offset: int = 0,
    ) -> tuple[list[WorkoutSession], int]:
        base = (
            select(WorkoutSession)
            .where(
                WorkoutSession.user_id == user_id,
                WorkoutSession.deleted_at.is_(None),
            )
        )
        total = db.scalar(select(func.count()).select_from(base.subquery())) or 0
        rows = db.scalars(
            base.options(*_with_detail())
            .order_by(WorkoutSession.session_date.desc(), WorkoutSession.created_at.desc())
            .limit(limit)
            .offset(offset)
        ).all()
        return list(rows), total

    def get_by_id(self, db: Session, workout_id: uuid.UUID) -> WorkoutSession | None:
        return db.scalar(
            select(WorkoutSession)
            .where(WorkoutSession.id == workout_id)
            .options(*_with_detail())
        )

    def clear_exercises(self, db: Session, session: WorkoutSession) -> None:
        """Delete all workout_exercises (and their sets via cascade) for a session."""
        for we in list(session.workout_exercises):
            db.delete(we)
        db.flush()
        session.workout_exercises.clear()

    def hard_delete(self, db: Session, session: WorkoutSession) -> None:
        db.delete(session)
        db.flush()


workout_repo = WorkoutRepository()
