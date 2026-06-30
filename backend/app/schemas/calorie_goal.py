from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class CalorieGoalRequest(BaseModel):
    daily_calories: int = Field(ge=1, le=10000)


class CalorieGoalResponse(BaseModel):
    id: uuid.UUID
    daily_calories: int
    created_at: datetime
    updated_at: datetime
