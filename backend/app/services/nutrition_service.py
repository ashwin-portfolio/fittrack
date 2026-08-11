from __future__ import annotations

import uuid
from datetime import date, timedelta

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories.calorie_goal_repository import calorie_goal_repo
from app.repositories.feed_repository import feed_repo
from app.repositories.nutrition_repository import nutrition_repo
from app.schemas.nutrition import (
    DailySummaryResponse,
    FavouriteMealRequest,
    FavouriteMealResponse,
    NutritionCreateRequest,
    NutritionListResponse,
    NutritionResponse,
    NutritionStreakResponse,
    RecentFoodResponse,
    WeeklyCalorieDay,
    WeeklySummaryResponse,
)


def _compute_streaks(logged_dates: list[date]) -> tuple[int, int]:
    """Return (current_streak, longest_streak) in consecutive days."""
    if not logged_dates:
        return 0, 0

    unique_dates = sorted(set(logged_dates))

    longest = 1
    run = 1
    for i in range(1, len(unique_dates)):
        if (unique_dates[i] - unique_dates[i - 1]).days == 1:
            run += 1
        else:
            run = 1
        longest = max(longest, run)

    date_set = set(unique_dates)
    today = date.today()
    if today in date_set:
        cursor = today
    elif (today - timedelta(days=1)) in date_set:
        # Still "alive" until the day rolls over without today logged.
        cursor = today - timedelta(days=1)
    else:
        return 0, longest

    current = 0
    while cursor in date_set:
        current += 1
        cursor -= timedelta(days=1)
    return current, longest


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

    def weekly_summary(
        self, db: Session, current_user: User
    ) -> WeeklySummaryResponse:
        today = date.today()
        week_start = today - timedelta(days=today.weekday())  # Monday of current week
        week_end = week_start + timedelta(days=6)             # Sunday

        calories_by_date = nutrition_repo.calories_by_date_range(
            db, current_user.id, week_start, week_end
        )
        goal = calorie_goal_repo.get_for_user(db, current_user.id)
        daily_goal = goal.daily_calories if goal else None

        days = [
            WeeklyCalorieDay(
                date=week_start + timedelta(days=i),
                day_label=(week_start + timedelta(days=i)).strftime("%a"),
                calories=calories_by_date.get(week_start + timedelta(days=i), 0.0),
                goal_calories=daily_goal,
            )
            for i in range(7)
        ]

        total_calories = sum(d.calories for d in days)
        # Average over days elapsed so far this week — future days are still 0
        # and would understate the average if divided across all 7.
        elapsed_days = min(today, week_end).toordinal() - week_start.toordinal() + 1
        average_calories = total_calories / elapsed_days if elapsed_days > 0 else 0.0

        return WeeklySummaryResponse(
            week_start=week_start,
            week_end=week_end,
            days=days,
            total_calories=total_calories,
            average_calories=round(average_calories, 1),
            daily_goal=daily_goal,
        )

    def streak(self, db: Session, current_user: User) -> NutritionStreakResponse:
        logged_dates = nutrition_repo.list_logged_dates(db, current_user.id)
        current_streak, longest_streak = _compute_streaks(logged_dates)
        return NutritionStreakResponse(
            current_streak=current_streak, longest_streak=longest_streak
        )

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

    # ── Favourites ────────────────────────────────────────────────────────────

    def list_favourites(
        self, db: Session, current_user: User
    ) -> list[FavouriteMealResponse]:
        favs = nutrition_repo.list_favourites(db, current_user.id)
        return [FavouriteMealResponse.model_validate(f) for f in favs]

    def add_favourite(
        self, db: Session, current_user: User, body: FavouriteMealRequest
    ) -> FavouriteMealResponse:
        fav = nutrition_repo.upsert_favourite(
            db,
            user_id=current_user.id,
            food_name=body.food_name.strip(),
            calories=body.calories,
            protein_g=body.protein_g,
            carbs_g=body.carbs_g,
            fat_g=body.fat_g,
        )
        return FavouriteMealResponse.model_validate(fav)

    def remove_favourite(
        self, db: Session, current_user: User, favourite_id: uuid.UUID
    ) -> None:
        fav = nutrition_repo.get_favourite_by_id(db, favourite_id)
        if fav is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Favourite not found")
        if fav.user_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        nutrition_repo.delete_favourite(db, fav)


nutrition_service = NutritionService()
