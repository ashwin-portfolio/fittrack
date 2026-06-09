from __future__ import annotations

import uuid
from datetime import date, datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.nutrition import NutritionEntry


class NutritionRepository:
    def create(
        self,
        db: Session,
        *,
        user_id: uuid.UUID,
        entry_date: date,
        meal_type: str,
        food_name: str,
        calories: float,
        protein_g: float | None,
        carbs_g: float | None,
        fat_g: float | None,
        is_shared: bool,
    ) -> NutritionEntry:
        entry = NutritionEntry(
            user_id=user_id,
            entry_date=entry_date,
            meal_type=meal_type,
            food_name=food_name,
            calories=calories,
            protein_g=protein_g,
            carbs_g=carbs_g,
            fat_g=fat_g,
            is_shared=is_shared,
        )
        db.add(entry)
        db.flush()
        return entry

    def list_for_user(
        self,
        db: Session,
        user_id: uuid.UUID,
        *,
        entry_date: date | None = None,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[list[NutritionEntry], int]:
        base = select(NutritionEntry).where(
            NutritionEntry.user_id == user_id,
            NutritionEntry.deleted_at.is_(None),
        )
        if entry_date:
            base = base.where(NutritionEntry.entry_date == entry_date)

        total = db.scalar(select(func.count()).select_from(base.subquery())) or 0
        rows = db.scalars(
            base.order_by(
                NutritionEntry.entry_date.desc(),
                NutritionEntry.created_at.desc(),
            )
            .limit(limit)
            .offset(skip)
        ).all()
        return list(rows), total

    def get_by_id(self, db: Session, entry_id: uuid.UUID) -> NutritionEntry | None:
        return db.scalar(
            select(NutritionEntry).where(
                NutritionEntry.id == entry_id,
                NutritionEntry.deleted_at.is_(None),
            )
        )

    def daily_totals(
        self, db: Session, user_id: uuid.UUID, entry_date: date
    ) -> dict:
        row = db.execute(
            select(
                func.count().label("entry_count"),
                func.coalesce(func.sum(NutritionEntry.calories), 0.0).label("total_calories"),
                func.coalesce(func.sum(NutritionEntry.protein_g), 0.0).label("total_protein_g"),
                func.coalesce(func.sum(NutritionEntry.carbs_g), 0.0).label("total_carbs_g"),
                func.coalesce(func.sum(NutritionEntry.fat_g), 0.0).label("total_fat_g"),
            ).where(
                NutritionEntry.user_id == user_id,
                NutritionEntry.entry_date == entry_date,
                NutritionEntry.deleted_at.is_(None),
            )
        ).one()
        return row._asdict()

    def soft_delete(self, db: Session, entry: NutritionEntry) -> None:
        entry.deleted_at = datetime.now(timezone.utc)
        db.flush()


nutrition_repo = NutritionRepository()
