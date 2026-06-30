from __future__ import annotations

import uuid
from datetime import date

from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.models.goal import Goal


class GoalRepository:
    def get_active(self, db: Session, user_id: uuid.UUID) -> Goal | None:
        return db.scalar(
            select(Goal).where(
                Goal.user_id == user_id,
                Goal.is_active.is_(True),
            )
        )

    def deactivate_all(self, db: Session, user_id: uuid.UUID) -> None:
        db.execute(
            update(Goal)
            .where(Goal.user_id == user_id, Goal.is_active.is_(True))
            .values(is_active=False)
        )

    def create(
        self,
        db: Session,
        *,
        user_id: uuid.UUID,
        goal_type: str,
        target_weight_kg: float | None,
        target_date: date | None = None,
        weekly_workout_target: int | None = None,
    ) -> Goal:
        goal = Goal(
            user_id=user_id,
            goal_type=goal_type,
            target_weight_kg=target_weight_kg,
            target_date=target_date,
            weekly_workout_target=weekly_workout_target,
            is_active=True,
        )
        db.add(goal)
        db.flush()
        return goal


goal_repo = GoalRepository()
