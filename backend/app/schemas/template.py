from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class TemplateSetCreate(BaseModel):
    set_number: int = Field(ge=1, le=100)
    reps: int = Field(ge=1, le=999)
    weight_kg: float = Field(ge=0.0, le=1000.0, default=0.0)


class TemplateExerciseCreate(BaseModel):
    exercise_id: uuid.UUID
    sets: list[TemplateSetCreate] = Field(min_length=1)


class TemplateCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    notes: str | None = None
    exercises: list[TemplateExerciseCreate] = []


class SaveAsTemplateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    notes: str | None = None


class TemplateSetResponse(BaseModel):
    id: uuid.UUID
    set_number: int
    reps: int
    weight_kg: float


class TemplateExerciseResponse(BaseModel):
    id: uuid.UUID
    exercise_id: uuid.UUID
    exercise_name: str
    muscle_group: str
    order_index: int
    sets: list[TemplateSetResponse]


class TemplateResponse(BaseModel):
    id: uuid.UUID
    name: str
    notes: str | None
    exercises: list[TemplateExerciseResponse]
    exercise_count: int
    created_at: datetime
    updated_at: datetime


class TemplateListResponse(BaseModel):
    templates: list[TemplateResponse]
    total: int
