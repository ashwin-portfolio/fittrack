from __future__ import annotations

import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models.meal_template import MealTemplate, MealTemplateItem


class MealTemplateRepository:
    def _with_items(self, stmt):
        return stmt.options(selectinload(MealTemplate.items))

    def create(
        self, db: Session, *, user_id: uuid.UUID, name: str, meal_type: str
    ) -> MealTemplate:
        template = MealTemplate(user_id=user_id, name=name, meal_type=meal_type)
        db.add(template)
        db.flush()
        return template

    def add_item(
        self,
        db: Session,
        *,
        template_id: uuid.UUID,
        food_name: str,
        calories: float,
        protein_g: float | None,
        carbs_g: float | None,
        fat_g: float | None,
        order_index: int,
    ) -> MealTemplateItem:
        item = MealTemplateItem(
            template_id=template_id,
            food_name=food_name,
            calories=calories,
            protein_g=protein_g,
            carbs_g=carbs_g,
            fat_g=fat_g,
            order_index=order_index,
        )
        db.add(item)
        return item

    def list_for_user(
        self, db: Session, user_id: uuid.UUID, *, limit: int = 50, offset: int = 0
    ) -> tuple[list[MealTemplate], int]:
        total = db.scalar(
            select(func.count(MealTemplate.id)).where(MealTemplate.user_id == user_id)
        ) or 0
        stmt = (
            self._with_items(select(MealTemplate))
            .where(MealTemplate.user_id == user_id)
            .order_by(MealTemplate.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        templates = list(db.scalars(stmt).all())
        return templates, total

    def get_by_id(self, db: Session, template_id: uuid.UUID) -> MealTemplate | None:
        return db.scalar(
            self._with_items(select(MealTemplate)).where(MealTemplate.id == template_id)
        )

    def delete(self, db: Session, template: MealTemplate) -> None:
        db.delete(template)


meal_template_repo = MealTemplateRepository()
