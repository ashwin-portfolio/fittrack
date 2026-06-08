from __future__ import annotations

import uuid
from datetime import date, datetime

from pydantic import BaseModel, Field


# ── Create (nested input) ─────────────────────────────────────────────────────

class ExerciseSetCreate(BaseModel):
    set_number: int = Field(ge=1, le=100)
    reps: int = Field(ge=1, le=999)
    weight_kg: float = Field(ge=0.0, le=1000.0, default=0.0)


class WorkoutExerciseCreate(BaseModel):
    exercise_id: uuid.UUID
    sets: list[ExerciseSetCreate] = Field(min_length=1)


class WorkoutCreateRequest(BaseModel):
    session_date: date
    name: str | None = Field(default=None, max_length=100)
    notes: str | None = None
    is_shared: bool = False
    exercises: list[WorkoutExerciseCreate] = []


# ── Read (nested output) ──────────────────────────────────────────────────────

class ExerciseSetResponse(BaseModel):
    id: uuid.UUID
    set_number: int
    reps: int
    weight_kg: float


class WorkoutExerciseResponse(BaseModel):
    id: uuid.UUID
    exercise_id: uuid.UUID
    exercise_name: str
    muscle_group: str
    order_index: int
    sets: list[ExerciseSetResponse]


class WorkoutResponse(BaseModel):
    id: uuid.UUID
    session_date: date
    name: str | None
    notes: str | None
    is_shared: bool
    exercises: list[WorkoutExerciseResponse]
    created_at: datetime
    updated_at: datetime


# ── List (summary) ────────────────────────────────────────────────────────────

class WorkoutSummary(BaseModel):
    id: uuid.UUID
    session_date: date
    name: str | None
    is_shared: bool
    exercise_count: int
    total_sets: int
    created_at: datetime


class WorkoutListResponse(BaseModel):
    workouts: list[WorkoutSummary]
    total: int
