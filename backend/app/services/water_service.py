from __future__ import annotations

import uuid
from datetime import date

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories.water_repository import water_goal_repo, water_repo
from app.schemas.water import (
    DEFAULT_DAILY_TARGET_ML,
    WaterDailySummaryResponse,
    WaterGoalRequest,
    WaterGoalResponse,
    WaterLogRequest,
    WaterLogResponse,
)


class WaterService:
    def log_water(
        self, db: Session, current_user: User, body: WaterLogRequest
    ) -> WaterLogResponse:
        entry = water_repo.create(
            db,
            user_id=current_user.id,
            log_date=body.log_date or date.today(),
            amount_ml=body.amount_ml,
        )
        return WaterLogResponse.model_validate(entry)

    def daily_summary(
        self, db: Session, current_user: User, target_date: date
    ) -> WaterDailySummaryResponse:
        entries = water_repo.list_for_date(db, current_user.id, target_date)
        goal = water_goal_repo.get_for_user(db, current_user.id)
        return WaterDailySummaryResponse(
            date=target_date,
            total_ml=sum(e.amount_ml for e in entries),
            goal_ml=goal.daily_target_ml if goal else DEFAULT_DAILY_TARGET_ML,
            entries=[WaterLogResponse.model_validate(e) for e in entries],
        )

    def delete(self, db: Session, current_user: User, entry_id: uuid.UUID) -> None:
        entry = water_repo.get_by_id(db, entry_id)
        if entry is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Water log not found."
            )
        if entry.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Access denied."
            )
        water_repo.delete(db, entry)

    def get_goal(self, db: Session, current_user: User) -> WaterGoalResponse:
        goal = water_goal_repo.get_for_user(db, current_user.id)
        return WaterGoalResponse(
            daily_target_ml=goal.daily_target_ml if goal else DEFAULT_DAILY_TARGET_ML
        )

    def set_goal(
        self, db: Session, current_user: User, body: WaterGoalRequest
    ) -> WaterGoalResponse:
        goal = water_goal_repo.upsert(db, current_user.id, body.daily_target_ml)
        return WaterGoalResponse(daily_target_ml=goal.daily_target_ml)


water_service = WaterService()
