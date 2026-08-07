import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user, get_db
from app.models.user import User
from app.schemas.meal_template import (
    ApplyMealTemplateRequest,
    MealTemplateCreateRequest,
    MealTemplateListResponse,
    MealTemplateResponse,
    SaveMealAsTemplateRequest,
)
from app.schemas.nutrition import NutritionResponse
from app.services.meal_template_service import meal_template_service

router = APIRouter()

# ── Literal routes FIRST — /from-day before /{template_id} ───────────────────


@router.get("", response_model=MealTemplateListResponse)
def list_templates(
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return meal_template_service.list_templates(db, current_user, limit=limit, offset=offset)


@router.post("", response_model=MealTemplateResponse, status_code=201)
def create_template(
    body: MealTemplateCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return meal_template_service.create_template(db, current_user, body)


@router.post("/from-day", response_model=MealTemplateResponse, status_code=201)
def save_meal_as_template(
    body: SaveMealAsTemplateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return meal_template_service.save_meal_as_template(db, current_user, body)


@router.delete("/{template_id}", status_code=204)
def delete_template(
    template_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    meal_template_service.delete_template(db, current_user, template_id)


@router.post("/{template_id}/apply", response_model=list[NutritionResponse], status_code=201)
def apply_template(
    template_id: uuid.UUID,
    body: ApplyMealTemplateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return meal_template_service.apply_template(db, current_user, template_id, body)
