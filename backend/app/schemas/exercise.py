from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from app.core.constants import MuscleGroup


class ExerciseResponse(BaseModel):
    id: uuid.UUID
    name: str
    muscle_group: str
    is_system: bool
    created_by_user_id: uuid.UUID | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ExerciseListResponse(BaseModel):
    exercises: list[ExerciseResponse]
    total: int


class ExerciseCreateRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    muscle_group: MuscleGroup
