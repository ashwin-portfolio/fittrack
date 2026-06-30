from __future__ import annotations

import uuid

from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator


class RegisterRequest(BaseModel):
    email: EmailStr
    username: str = Field(min_length=3, max_length=20)
    password: str = Field(min_length=8, max_length=128)
    display_name: str = Field(min_length=1, max_length=100)

    @field_validator("username")
    @classmethod
    def username_alphanumeric(cls, v: str) -> str:
        if not v.replace("_", "").replace("-", "").isalnum():
            raise ValueError("Username may only contain letters, numbers, hyphens, and underscores.")
        return v.lower()


class LoginRequest(BaseModel):
    identifier: str  # email address or username
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class LogoutRequest(BaseModel):
    refresh_token: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=8, max_length=128)
    confirm_password: str

    @model_validator(mode="after")
    def passwords_match(self) -> "ResetPasswordRequest":
        if self.new_password != self.confirm_password:
            raise ValueError("Passwords do not match")
        return self


# ── Responses ─────────────────────────────────────────────────────────────────

class UserPublic(BaseModel):
    id: uuid.UUID
    email: str
    username: str
    is_email_verified: bool = False

    model_config = {"from_attributes": True}


class MessageResponse(BaseModel):
    message: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserPublic


class AccessTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class RegisterResponse(BaseModel):
    message: str
    user: UserPublic


class LogoutResponse(BaseModel):
    message: str
