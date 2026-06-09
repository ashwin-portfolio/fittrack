from __future__ import annotations

import uuid
from datetime import date, datetime

from pydantic import BaseModel, Field


class WeightLogRequest(BaseModel):
    log_date: date
    weight_kg: float = Field(ge=20.0, le=500.0)
    is_shared: bool = False


class WeightLogResponse(BaseModel):
    id: uuid.UUID
    log_date: date
    weight_kg: float
    delta_kg: float | None
    is_shared: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class WeightHistoryResponse(BaseModel):
    items: list[WeightLogResponse]
    first_weight_kg: float | None
    latest_weight_kg: float | None
    total_change_kg: float | None
