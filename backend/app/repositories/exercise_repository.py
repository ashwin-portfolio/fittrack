from __future__ import annotations

import uuid

from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.models.exercise import Exercise


class ExerciseRepository:
    def list_for_user(
        self,
        db: Session,
        user_id: uuid.UUID,
        *,
        muscle_group: str | None = None,
        search: str | None = None,
    ) -> list[Exercise]:
        # System exercises visible to everyone + this user's custom exercises
        stmt = select(Exercise).where(
            or_(Exercise.is_system.is_(True), Exercise.created_by_user_id == user_id)
        )
        if muscle_group:
            stmt = stmt.where(Exercise.muscle_group == muscle_group)
        if search:
            stmt = stmt.where(Exercise.name.ilike(f"%{search}%"))
        stmt = stmt.order_by(Exercise.is_system.desc(), Exercise.muscle_group, Exercise.name)
        return list(db.scalars(stmt).all())

    def get_by_id(self, db: Session, exercise_id: uuid.UUID) -> Exercise | None:
        return db.get(Exercise, exercise_id)

    def get_custom_by_name(
        self, db: Session, user_id: uuid.UUID, name: str
    ) -> Exercise | None:
        return db.scalar(
            select(Exercise).where(
                Exercise.created_by_user_id == user_id,
                Exercise.name.ilike(name),
            )
        )

    def create(
        self,
        db: Session,
        *,
        name: str,
        muscle_group: str,
        user_id: uuid.UUID,
    ) -> Exercise:
        exercise = Exercise(
            name=name,
            muscle_group=muscle_group,
            is_system=False,
            created_by_user_id=user_id,
        )
        db.add(exercise)
        db.flush()
        return exercise


exercise_repo = ExerciseRepository()
