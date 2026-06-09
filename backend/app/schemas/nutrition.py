from __future__ import annotations

import uuid
from datetime import date, datetime

from pydantic import BaseModel, Field

from app.core.constants import MealType


class NutritionCreateRequest(BaseModel):
    entry_date: date
    meal_type: MealType
    food_name: str = Field(min_length=1, max_length=200)
    calories: float = Field(ge=0, le=10000)
    protein_g: float | None = Field(default=None, ge=0, le=1000)
    carbs_g: float | None = Field(default=None, ge=0, le=1000)
    fat_g: float | None = Field(default=None, ge=0, le=1000)
    is_shared: bool = False


class NutritionResponse(BaseModel):
    id: uuid.UUID
    entry_date: date
    meal_type: str
    food_name: str
    calories: float
    protein_g: float | None
    carbs_g: float | None
    fat_g: float | None
    is_shared: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class NutritionListResponse(BaseModel):
    items: list[NutritionResponse]
    total: int
    skip: int
    limit: int


class DailySummaryResponse(BaseModel):
    date: date
    total_calories: float
    total_protein_g: float
    total_carbs_g: float
    total_fat_g: float
    entry_count: int
