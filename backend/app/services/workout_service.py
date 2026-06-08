from __future__ import annotations

import uuid

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.workout import WorkoutSession
from app.repositories.exercise_repository import exercise_repo
from app.repositories.workout_repository import workout_repo
from app.schemas.workout import (
    ExerciseSetResponse,
    WorkoutCreateRequest,
    WorkoutExerciseResponse,
    WorkoutListResponse,
    WorkoutResponse,
    WorkoutSummary,
)


def _build_response(session: WorkoutSession) -> WorkoutResponse:
    exercises = [
        WorkoutExerciseResponse(
            id=we.id,
            exercise_id=we.exercise_id,
            exercise_name=we.exercise.name,
            muscle_group=we.exercise.muscle_group,
            order_index=we.order_index,
            sets=[
                ExerciseSetResponse(
                    id=s.id,
                    set_number=s.set_number,
                    reps=s.reps,
                    weight_kg=s.weight_kg,
                )
                for s in we.sets
            ],
        )
        for we in session.workout_exercises
    ]
    return WorkoutResponse(
        id=session.id,
        session_date=session.session_date,
        name=session.name,
        notes=session.notes,
        is_shared=session.is_shared,
        exercises=exercises,
        created_at=session.created_at,
        updated_at=session.updated_at,
    )


def _check_ownership(session: WorkoutSession | None, user_id: uuid.UUID) -> WorkoutSession:
    if session is None or session.deleted_at is not None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workout not found")
    if session.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return session


class WorkoutService:
    def create_workout(
        self, db: Session, current_user: User, body: WorkoutCreateRequest
    ) -> WorkoutResponse:
        # Validate all exercise_ids are accessible (system or owned by this user)
        for item in body.exercises:
            ex = exercise_repo.get_by_id(db, item.exercise_id)
            if ex is None or (not ex.is_system and ex.created_by_user_id != current_user.id):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Exercise {item.exercise_id} not found or not accessible",
                )

        session = workout_repo.create_session(
            db,
            user_id=current_user.id,
            session_date=body.session_date,
            name=body.name,
            notes=body.notes,
            is_shared=body.is_shared,
        )

        for idx, item in enumerate(body.exercises):
            we = workout_repo.add_exercise(
                db,
                session_id=session.id,
                exercise_id=item.exercise_id,
                order_index=idx,
            )
            for s in item.sets:
                workout_repo.add_set(
                    db,
                    workout_exercise_id=we.id,
                    set_number=s.set_number,
                    reps=s.reps,
                    weight_kg=s.weight_kg,
                )

        # Reload with full relationships for response
        db.flush()
        db.refresh(session, ["workout_exercises"])
        for we in session.workout_exercises:
            db.refresh(we, ["exercise", "sets"])

        return _build_response(session)

    def list_workouts(
        self,
        db: Session,
        current_user: User,
        *,
        limit: int = 20,
        offset: int = 0,
    ) -> WorkoutListResponse:
        sessions, total = workout_repo.list_for_user(
            db, current_user.id, limit=limit, offset=offset
        )
        summaries = [
            WorkoutSummary(
                id=s.id,
                session_date=s.session_date,
                name=s.name,
                is_shared=s.is_shared,
                exercise_count=len(s.workout_exercises),
                total_sets=sum(len(we.sets) for we in s.workout_exercises),
                created_at=s.created_at,
            )
            for s in sessions
        ]
        return WorkoutListResponse(workouts=summaries, total=total)

    def get_workout(
        self, db: Session, current_user: User, workout_id: uuid.UUID
    ) -> WorkoutResponse:
        session = workout_repo.get_by_id(db, workout_id)
        _check_ownership(session, current_user.id)
        return _build_response(session)  # type: ignore[arg-type]

    def delete_workout(
        self, db: Session, current_user: User, workout_id: uuid.UUID
    ) -> None:
        session = workout_repo.get_by_id(db, workout_id)
        _check_ownership(session, current_user.id)
        workout_repo.soft_delete(db, session)  # type: ignore[arg-type]


workout_service = WorkoutService()
