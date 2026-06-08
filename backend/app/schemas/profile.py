from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, Field, field_validator

from app.core.constants import GENDERS, Gender


class ProfileResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    full_name: str
    age: int | None
    gender: str | None
    height_cm: float | None
    bio: str | None
    is_public: bool
    avatar_color: str
    onboarding_complete: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ProfileUpdateRequest(BaseModel):
    full_name: str | None = Field(default=None, min_length=1, max_length=100)
    age: int | None = Field(default=None, ge=13, le=120)
    gender: Gender | None = None
    height_cm: float | None = Field(default=None, gt=50, le=300)
    bio: str | None = Field(default=None, max_length=160)
    is_public: bool | None = None


class OnboardingRequest(BaseModel):
    age: int = Field(ge=13, le=120)
    gender: Gender
    height_cm: float | None = Field(default=None, gt=50, le=300)

    @field_validator("gender")
    @classmethod
    def gender_valid(cls, v: str) -> str:
        if v not in GENDERS:
            raise ValueError(f"gender must be one of: {sorted(GENDERS)}")
        return v
