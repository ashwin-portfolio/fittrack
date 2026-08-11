from __future__ import annotations

import uuid
from datetime import date, datetime

from pydantic import BaseModel, Field

DEFAULT_DAILY_TARGET_ML = 2000


class WaterLogRequest(BaseModel):
    amount_ml: int = Field(ge=1, le=5000)
    log_date: date | None = None


class WaterLogResponse(BaseModel):
    id: uuid.UUID
    log_date: date
    amount_ml: int
    created_at: datetime

    model_config = {"from_attributes": True}


class WaterDailySummaryResponse(BaseModel):
    date: date
    total_ml: int
    goal_ml: int
    entries: list[WaterLogResponse]


class WaterGoalRequest(BaseModel):
    daily_target_ml: int = Field(ge=100, le=10000)


class WaterGoalResponse(BaseModel):
    daily_target_ml: int
