from __future__ import annotations

import uuid
from datetime import date, datetime

from pydantic import BaseModel, Field

DEFAULT_DAILY_TARGET_ML = 2000
# One glass, for the ml/glasses toggle on the history chart. Matches the
# smallest quick-add button in the UI.
GLASS_ML = 250


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


class WaterHistoryDay(BaseModel):
    date: date
    day_label: str          # "Mon", "Tue", ...
    total_ml: int


class WaterHistoryResponse(BaseModel):
    start_date: date
    end_date: date
    days: list[WaterHistoryDay]
    total_ml: int
    average_ml: int
    daily_target_ml: int
    glass_ml: int


class WaterGoalRequest(BaseModel):
    daily_target_ml: int = Field(ge=100, le=10000)


class WaterGoalResponse(BaseModel):
    daily_target_ml: int
