from __future__ import annotations

import uuid
from datetime import date, timedelta

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories.water_repository import water_goal_repo, water_repo
from app.schemas.water import (
    DEFAULT_DAILY_TARGET_ML,
    GLASS_ML,
    WaterDailySummaryResponse,
    WaterGoalRequest,
    WaterGoalResponse,
    WaterHistoryDay,
    WaterHistoryResponse,
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

    def history(
        self, db: Session, current_user: User, days: int
    ) -> WaterHistoryResponse:
        end_date = date.today()
        start_date = end_date - timedelta(days=days - 1)

        totals = water_repo.totals_by_date_range(
            db, current_user.id, start_date, end_date
        )
        goal = water_goal_repo.get_for_user(db, current_user.id)

        day_list = [
            WaterHistoryDay(
                date=start_date + timedelta(days=i),
                day_label=(start_date + timedelta(days=i)).strftime("%a"),
                total_ml=totals.get(start_date + timedelta(days=i), 0),
            )
            for i in range(days)
        ]

        total_ml = sum(d.total_ml for d in day_list)

        return WaterHistoryResponse(
            start_date=start_date,
            end_date=end_date,
            days=day_list,
            total_ml=total_ml,
            # Every day in a trailing window has already elapsed, so this divides
            # across the full range — unlike the Mon–Sun calorie week, which has
            # to divide by days elapsed so far to avoid understating the average.
            average_ml=round(total_ml / days) if days else 0,
            daily_target_ml=goal.daily_target_ml if goal else DEFAULT_DAILY_TARGET_ML,
            glass_ml=GLASS_ML,
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
