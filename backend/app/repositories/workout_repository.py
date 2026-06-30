from __future__ import annotations

import uuid
from datetime import date, timedelta

from sqlalchemy import func, select, text  # noqa: F401
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

    def get_personal_records(self, db: Session, user_id: uuid.UUID) -> list[dict]:
        sql = text("""
            WITH max_per_exercise AS (
                SELECT
                    we.exercise_id,
                    MAX(es.weight_kg)          AS max_weight_kg,
                    COUNT(DISTINCT ws.id)      AS times_performed
                FROM workout_sessions ws
                JOIN workout_exercises we ON we.session_id = ws.id
                JOIN exercise_sets    es ON es.workout_exercise_id = we.id
                WHERE ws.user_id    = :user_id
                  AND ws.deleted_at IS NULL
                  AND es.weight_kg  > 0
                GROUP BY we.exercise_id
            )
            SELECT
                e.id            AS exercise_id,
                e.name          AS exercise_name,
                e.muscle_group,
                mpe.max_weight_kg,
                mpe.times_performed,
                MIN(ws.session_date) AS achieved_on
            FROM max_per_exercise mpe
            JOIN exercises         e  ON e.id  = mpe.exercise_id
            JOIN workout_exercises we ON we.exercise_id = mpe.exercise_id
            JOIN workout_sessions  ws ON ws.id = we.session_id
                                     AND ws.user_id    = :user_id
                                     AND ws.deleted_at IS NULL
            JOIN exercise_sets     es ON es.workout_exercise_id = we.id
                                     AND es.weight_kg = mpe.max_weight_kg
            GROUP BY e.id, e.name, e.muscle_group, mpe.max_weight_kg, mpe.times_performed
            ORDER BY mpe.max_weight_kg DESC
        """)
        rows = db.execute(sql, {"user_id": str(user_id)}).mappings().all()
        return [dict(r) for r in rows]


    def count_this_week(self, db: Session, user_id: uuid.UUID) -> int:
        today = date.today()
        monday = today - timedelta(days=today.weekday())
        result = db.scalar(
            select(func.count())
            .select_from(WorkoutSession)
            .where(
                WorkoutSession.user_id == user_id,
                WorkoutSession.session_date >= monday,
                WorkoutSession.session_date <= today,
                WorkoutSession.deleted_at.is_(None),
            )
        )
        return result or 0

    def get_logged_exercises(self, db: Session, user_id: uuid.UUID) -> list[dict]:
        sql = text("""
            SELECT
                e.id           AS exercise_id,
                e.name         AS exercise_name,
                e.muscle_group,
                COUNT(DISTINCT ws.id) AS session_count
            FROM exercises e
            JOIN workout_exercises we ON we.exercise_id = e.id
            JOIN workout_sessions  ws ON ws.id = we.session_id
            WHERE ws.user_id    = :user_id
              AND ws.deleted_at IS NULL
            GROUP BY e.id, e.name, e.muscle_group
            ORDER BY session_count DESC, e.name ASC
        """)
        rows = db.execute(sql, {"user_id": str(user_id)}).mappings().all()
        return [dict(r) for r in rows]

    def get_exercise_history(
        self, db: Session, user_id: uuid.UUID, exercise_id: uuid.UUID
    ) -> list[dict]:
        sql = text("""
            SELECT
                ws.session_date,
                MAX(es.weight_kg)              AS max_weight_kg,
                COUNT(DISTINCT es.id)          AS total_sets,
                CAST(SUM(es.reps) AS INTEGER)  AS total_reps,
                SUM(es.weight_kg * es.reps)    AS total_volume_kg,
                e.name                         AS exercise_name,
                e.muscle_group
            FROM workout_sessions  ws
            JOIN workout_exercises we ON we.session_id    = ws.id
                                     AND we.exercise_id  = :exercise_id
            JOIN exercise_sets    es ON es.workout_exercise_id = we.id
            JOIN exercises         e ON e.id              = we.exercise_id
            WHERE ws.user_id    = :user_id
              AND ws.deleted_at IS NULL
            GROUP BY ws.session_date, e.name, e.muscle_group
            ORDER BY ws.session_date ASC
        """)
        rows = db.execute(
            sql, {"user_id": str(user_id), "exercise_id": str(exercise_id)}
        ).mappings().all()
        return [dict(r) for r in rows]


workout_repo = WorkoutRepository()
