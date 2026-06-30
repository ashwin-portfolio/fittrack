from __future__ import annotations

import uuid
from datetime import date, datetime

from pydantic import BaseModel, Field, model_validator

from app.core.constants import GoalType

_WEIGHT_GOAL_TYPES = {"weight_loss", "weight_gain", "muscle_gain"}


class GoalCreateRequest(BaseModel):
    goal_type: GoalType
    target_weight_kg: float | None = Field(default=None, ge=20.0, le=500.0)
    target_date: date | None = None
    weekly_workout_target: int | None = Field(default=None, ge=1, le=7)

    @model_validator(mode="after")
    def validate_fields(self) -> "GoalCreateRequest":
        if self.goal_type in _WEIGHT_GOAL_TYPES and self.target_weight_kg is None:
            raise ValueError("target_weight_kg is required for weight and muscle goals")
        if self.goal_type == "workout_frequency" and self.weekly_workout_target is None:
            raise ValueError("weekly_workout_target is required for workout_frequency goals")
        return self


class GoalResponse(BaseModel):
    id: uuid.UUID
    goal_type: str
    target_weight_kg: float | None
    target_date: date | None
    weekly_workout_target: int | None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class WorkoutProgressResponse(BaseModel):
    workouts_this_week: int
    weekly_target: int | None
