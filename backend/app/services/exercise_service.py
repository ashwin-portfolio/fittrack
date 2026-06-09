from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories.exercise_repository import exercise_repo
from app.schemas.exercise import (
    ExerciseCreateRequest,
    ExerciseListResponse,
    ExerciseResponse,
)


class ExerciseService:
    def list_exercises(
        self,
        db: Session,
        current_user: User,
        *,
        muscle_group: str | None = None,
        q: str | None = None,
        skip: int = 0,
        limit: int = 100,
    ) -> ExerciseListResponse:
        exercises, total = exercise_repo.list_for_user(
            db, current_user.id, muscle_group=muscle_group, q=q, skip=skip, limit=limit
        )
        return ExerciseListResponse(
            exercises=[ExerciseResponse.model_validate(e) for e in exercises],
            total=total,
        )

    def create_exercise(
        self, db: Session, current_user: User, body: ExerciseCreateRequest
    ) -> ExerciseResponse:
        # Reject duplicate name within this user's custom exercises (case-insensitive)
        existing = exercise_repo.get_custom_by_name(db, current_user.id, body.name)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"You already have a custom exercise named '{existing.name}'",
            )
        exercise = exercise_repo.create(
            db,
            name=body.name.strip(),
            muscle_group=body.muscle_group,
            user_id=current_user.id,
        )
        return ExerciseResponse.model_validate(exercise)


exercise_service = ExerciseService()
