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
        q: str | None = None,
        skip: int = 0,
        limit: int = 100,
    ) -> tuple[list[Exercise], int]:
        from sqlalchemy import func
        base = select(Exercise).where(
            or_(Exercise.is_system.is_(True), Exercise.created_by_user_id == user_id)
        )
        if muscle_group:
            base = base.where(Exercise.muscle_group == muscle_group)
        if q:
            base = base.where(Exercise.name.ilike(f"%{q}%"))
        base = base.order_by(Exercise.is_system.desc(), Exercise.muscle_group, Exercise.name)

        total = db.scalar(select(func.count()).select_from(base.subquery())) or 0
        rows = list(db.scalars(base.limit(limit).offset(skip)).all())
        return rows, total

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
