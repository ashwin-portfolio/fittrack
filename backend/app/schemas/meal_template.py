from __future__ import annotations

import uuid
from datetime import date, datetime

from pydantic import BaseModel, Field

from app.core.constants import MealType


class MealTemplateItemCreate(BaseModel):
    food_name: str = Field(min_length=1, max_length=200)
    calories: float = Field(ge=0, le=10000)
    protein_g: float | None = Field(default=None, ge=0, le=1000)
    carbs_g: float | None = Field(default=None, ge=0, le=1000)
    fat_g: float | None = Field(default=None, ge=0, le=1000)


class MealTemplateCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    meal_type: MealType
    items: list[MealTemplateItemCreate] = Field(min_length=1)


class SaveMealAsTemplateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    entry_date: date
    meal_type: MealType


class ApplyMealTemplateRequest(BaseModel):
    entry_date: date | None = None


class MealTemplateItemResponse(BaseModel):
    id: uuid.UUID
    food_name: str
    calories: float
    protein_g: float | None
    carbs_g: float | None
    fat_g: float | None


class MealTemplateResponse(BaseModel):
    id: uuid.UUID
    name: str
    meal_type: str
    items: list[MealTemplateItemResponse]
    item_count: int
    total_calories: float
    created_at: datetime


class MealTemplateListResponse(BaseModel):
    templates: list[MealTemplateResponse]
    total: int
