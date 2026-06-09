from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, Field, model_validator

from app.core.constants import GoalType


class GoalCreateRequest(BaseModel):
    goal_type: GoalType
    target_weight_kg: float | None = Field(default=None, ge=20.0, le=500.0)

    @model_validator(mode="after")
    def require_target_for_non_maintenance(self) -> "GoalCreateRequest":
        if self.goal_type != "maintenance" and self.target_weight_kg is None:
            raise ValueError("target_weight_kg is required unless goal_type is maintenance")
        return self


class GoalResponse(BaseModel):
    id: uuid.UUID
    goal_type: str
    target_weight_kg: float | None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
