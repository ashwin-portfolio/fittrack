from __future__ import annotations

import uuid
from datetime import date

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.meal_template import MealTemplate
from app.models.user import User
from app.repositories.meal_template_repository import meal_template_repo
from app.repositories.nutrition_repository import nutrition_repo
from app.schemas.meal_template import (
    ApplyMealTemplateRequest,
    MealTemplateCreateRequest,
    MealTemplateItemResponse,
    MealTemplateListResponse,
    MealTemplateResponse,
    SaveMealAsTemplateRequest,
)
from app.schemas.nutrition import NutritionResponse


def _build_response(template: MealTemplate) -> MealTemplateResponse:
    items = [
        MealTemplateItemResponse(
            id=item.id,
            food_name=item.food_name,
            calories=item.calories,
            protein_g=item.protein_g,
            carbs_g=item.carbs_g,
            fat_g=item.fat_g,
        )
        for item in template.items
    ]
    return MealTemplateResponse(
        id=template.id,
        name=template.name,
        meal_type=template.meal_type,
        items=items,
        item_count=len(items),
        total_calories=sum(i.calories for i in items),
        created_at=template.created_at,
    )


def _check_ownership(template: MealTemplate | None, user_id: uuid.UUID) -> MealTemplate:
    if template is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")
    if template.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return template


class MealTemplateService:
    def create_template(
        self, db: Session, current_user: User, body: MealTemplateCreateRequest
    ) -> MealTemplateResponse:
        template = meal_template_repo.create(
            db, user_id=current_user.id, name=body.name, meal_type=body.meal_type
        )
        for idx, item in enumerate(body.items):
            meal_template_repo.add_item(
                db,
                template_id=template.id,
                food_name=item.food_name,
                calories=item.calories,
                protein_g=item.protein_g,
                carbs_g=item.carbs_g,
                fat_g=item.fat_g,
                order_index=idx,
            )
        db.flush()
        db.refresh(template, ["items"])
        return _build_response(template)

    def save_meal_as_template(
        self, db: Session, current_user: User, body: SaveMealAsTemplateRequest
    ) -> MealTemplateResponse:
        entries = nutrition_repo.list_by_date_and_meal_type(
            db, current_user.id, body.entry_date, body.meal_type
        )
        if not entries:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No entries logged for that date and meal type.",
            )

        template = meal_template_repo.create(
            db, user_id=current_user.id, name=body.name, meal_type=body.meal_type
        )
        for idx, entry in enumerate(entries):
            meal_template_repo.add_item(
                db,
                template_id=template.id,
                food_name=entry.food_name,
                calories=entry.calories,
                protein_g=entry.protein_g,
                carbs_g=entry.carbs_g,
                fat_g=entry.fat_g,
                order_index=idx,
            )
        db.flush()
        db.refresh(template, ["items"])
        return _build_response(template)

    def list_templates(
        self, db: Session, current_user: User, *, limit: int = 50, offset: int = 0
    ) -> MealTemplateListResponse:
        templates, total = meal_template_repo.list_for_user(
            db, current_user.id, limit=limit, offset=offset
        )
        return MealTemplateListResponse(
            templates=[_build_response(t) for t in templates],
            total=total,
        )

    def delete_template(
        self, db: Session, current_user: User, template_id: uuid.UUID
    ) -> None:
        template = meal_template_repo.get_by_id(db, template_id)
        _check_ownership(template, current_user.id)
        meal_template_repo.delete(db, template)  # type: ignore[arg-type]

    def apply_template(
        self,
        db: Session,
        current_user: User,
        template_id: uuid.UUID,
        body: ApplyMealTemplateRequest,
    ) -> list[NutritionResponse]:
        template = meal_template_repo.get_by_id(db, template_id)
        _check_ownership(template, current_user.id)
        entry_date = body.entry_date or date.today()

        created = [
            nutrition_repo.create(
                db,
                user_id=current_user.id,
                entry_date=entry_date,
                meal_type=template.meal_type,  # type: ignore[union-attr]
                food_name=item.food_name,
                calories=item.calories,
                protein_g=item.protein_g,
                carbs_g=item.carbs_g,
                fat_g=item.fat_g,
                is_shared=False,
            )
            for item in template.items  # type: ignore[union-attr]
        ]
        return [NutritionResponse.model_validate(e) for e in created]


meal_template_service = MealTemplateService()
