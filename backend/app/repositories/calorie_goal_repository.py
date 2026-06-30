from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.calorie_goal import CalorieGoal


class CalorieGoalRepository:
    def get_for_user(self, db: Session, user_id: uuid.UUID) -> CalorieGoal | None:
        return db.scalar(select(CalorieGoal).where(CalorieGoal.user_id == user_id))

    def upsert(
        self, db: Session, user_id: uuid.UUID, daily_calories: int
    ) -> CalorieGoal:
        goal = self.get_for_user(db, user_id)
        if goal is None:
            goal = CalorieGoal(user_id=user_id, daily_calories=daily_calories)
            db.add(goal)
        else:
            goal.daily_calories = daily_calories
        db.flush()
        return goal


calorie_goal_repo = CalorieGoalRepository()
