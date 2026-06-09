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


# ── Food database search (Open Food Facts) ────────────────────────────────────

class FoodSearchResult(BaseModel):
    food_name: str
    brand: str | None
    barcode: str | None
    calories_per_100g: float | None
    protein_per_100g: float | None
    carbs_per_100g: float | None
    fat_per_100g: float | None
    serving_description: str | None   # e.g. "1 cup (40 g)"
    serving_weight_g: float | None    # grams in one serving


class FoodSearchListResponse(BaseModel):
    items: list[FoodSearchResult]
    total: int
    query: str


# ── Recently eaten (from user's own history) ──────────────────────────────────

class RecentFoodResponse(BaseModel):
    food_name: str
    meal_type: str
    calories: float
    protein_g: float | None
    carbs_g: float | None
    fat_g: float | None
    last_eaten: datetime

    model_config = {"from_attributes": True}
