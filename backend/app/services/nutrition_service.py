from __future__ import annotations

import uuid
from datetime import date

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories.feed_repository import feed_repo
from app.repositories.nutrition_repository import nutrition_repo
from app.schemas.nutrition import (
    DailySummaryResponse,
    NutritionCreateRequest,
    NutritionListResponse,
    NutritionResponse,
    RecentFoodResponse,
)


class NutritionService:
    def create_entry(
        self, db: Session, current_user: User, body: NutritionCreateRequest
    ) -> NutritionResponse:
        entry = nutrition_repo.create(
            db,
            user_id=current_user.id,
            entry_date=body.entry_date,
            meal_type=body.meal_type,
            food_name=body.food_name.strip(),
            calories=body.calories,
            protein_g=body.protein_g,
            carbs_g=body.carbs_g,
            fat_g=body.fat_g,
            is_shared=body.is_shared,
        )
        if body.is_shared:
            feed_repo.create_feed_item(
                db, user_id=current_user.id, activity_type="meal",
                nutrition_entry_id=entry.id,
            )
        return NutritionResponse.model_validate(entry)

    def list_entries(
        self,
        db: Session,
        current_user: User,
        *,
        entry_date: date | None = None,
        skip: int = 0,
        limit: int = 20,
    ) -> NutritionListResponse:
        entries, total = nutrition_repo.list_for_user(
            db, current_user.id, entry_date=entry_date, skip=skip, limit=limit
        )
        return NutritionListResponse(
            items=[NutritionResponse.model_validate(e) for e in entries],
            total=total,
            skip=skip,
            limit=limit,
        )

    def daily_summary(
        self, db: Session, current_user: User, entry_date: date
    ) -> DailySummaryResponse:
        totals = nutrition_repo.daily_totals(db, current_user.id, entry_date)
        return DailySummaryResponse(date=entry_date, **totals)

    def recent_foods(
        self, db: Session, current_user: User, limit: int = 20
    ) -> list[RecentFoodResponse]:
        entries = nutrition_repo.recent_foods(db, current_user.id, limit=limit)
        return [
            RecentFoodResponse(
                food_name=e.food_name,
                meal_type=e.meal_type,
                calories=e.calories,
                protein_g=e.protein_g,
                carbs_g=e.carbs_g,
                fat_g=e.fat_g,
                last_eaten=e.created_at,
            )
            for e in entries
        ]

    def delete_entry(
        self, db: Session, current_user: User, entry_id: uuid.UUID
    ) -> None:
        entry = nutrition_repo.get_by_id(db, entry_id)
        if entry is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entry not found")
        if entry.user_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        feed_repo.soft_delete_by_nutrition(db, entry.id)
        nutrition_repo.soft_delete(db, entry)


nutrition_service = NutritionService()
