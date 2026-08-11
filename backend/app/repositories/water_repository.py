from __future__ import annotations

import uuid
from datetime import date

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.water import WaterGoal, WaterLog


class WaterRepository:
    def create(
        self, db: Session, *, user_id: uuid.UUID, log_date: date, amount_ml: int
    ) -> WaterLog:
        entry = WaterLog(user_id=user_id, log_date=log_date, amount_ml=amount_ml)
        db.add(entry)
        db.flush()
        return entry

    def list_for_date(
        self, db: Session, user_id: uuid.UUID, log_date: date
    ) -> list[WaterLog]:
        return list(
            db.scalars(
                select(WaterLog)
                .where(WaterLog.user_id == user_id, WaterLog.log_date == log_date)
                .order_by(WaterLog.created_at.asc())
            ).all()
        )

    def get_by_id(self, db: Session, entry_id: uuid.UUID) -> WaterLog | None:
        return db.scalar(select(WaterLog).where(WaterLog.id == entry_id))

    def delete(self, db: Session, entry: WaterLog) -> None:
        db.delete(entry)
        db.flush()


class WaterGoalRepository:
    def get_for_user(self, db: Session, user_id: uuid.UUID) -> WaterGoal | None:
        return db.scalar(select(WaterGoal).where(WaterGoal.user_id == user_id))

    def upsert(self, db: Session, user_id: uuid.UUID, daily_target_ml: int) -> WaterGoal:
        goal = self.get_for_user(db, user_id)
        if goal is None:
            goal = WaterGoal(user_id=user_id, daily_target_ml=daily_target_ml)
            db.add(goal)
        else:
            goal.daily_target_ml = daily_target_ml
        db.flush()
        return goal


water_repo = WaterRepository()
water_goal_repo = WaterGoalRepository()
