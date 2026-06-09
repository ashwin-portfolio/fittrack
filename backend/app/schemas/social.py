from __future__ import annotations

import uuid
from datetime import date, datetime

from pydantic import BaseModel, Field


# ── Shared ────────────────────────────────────────────────────────────────────

class FeedUserInfo(BaseModel):
    username: str
    full_name: str
    avatar_color: str


# ── Feed source detail blocks ─────────────────────────────────────────────────

class WorkoutFeedData(BaseModel):
    session_date: date
    name: str | None
    exercise_count: int
    total_sets: int
    total_volume_kg: float
    exercises: list[str]


class MealFeedData(BaseModel):
    meal_type: str
    food_name: str
    calories: float
    protein_g: float | None
    carbs_g: float | None
    fat_g: float | None


class WeightFeedData(BaseModel):
    weight_kg: float


# ── Feed item ─────────────────────────────────────────────────────────────────

class FeedItemResponse(BaseModel):
    id: uuid.UUID
    activity_type: str
    user: FeedUserInfo
    workout: WorkoutFeedData | None = None
    meal: MealFeedData | None = None
    weight: WeightFeedData | None = None
    kudos_count: int
    comment_count: int
    has_kudos: bool
    created_at: datetime


class FeedListResponse(BaseModel):
    items: list[FeedItemResponse]
    total: int
    skip: int
    limit: int


# ── Kudos ─────────────────────────────────────────────────────────────────────

class KudosResponse(BaseModel):
    feed_item_id: uuid.UUID
    kudos_count: int
    has_kudos: bool


# ── Comments ──────────────────────────────────────────────────────────────────

class CommentCreateRequest(BaseModel):
    content: str = Field(min_length=1, max_length=500)


class CommentResponse(BaseModel):
    id: uuid.UUID
    user: FeedUserInfo
    content: str
    is_own: bool
    created_at: datetime


class CommentListResponse(BaseModel):
    items: list[CommentResponse]
    total: int


# ── Follows ───────────────────────────────────────────────────────────────────

class FollowResponse(BaseModel):
    username: str
    is_following: bool
    follower_count: int


# ── Users (public listing / profiles) ────────────────────────────────────────

class UserListItem(BaseModel):
    username: str
    full_name: str
    avatar_color: str
    bio: str | None
    follower_count: int
    is_following: bool


class UserListResponse(BaseModel):
    items: list[UserListItem]
    total: int
    skip: int
    limit: int


class UserActivitySummary(BaseModel):
    id: uuid.UUID
    activity_type: str
    summary: str
    created_at: datetime


class UserProfileResponse(BaseModel):
    username: str
    full_name: str
    bio: str | None
    avatar_color: str
    is_public: bool
    follower_count: int
    following_count: int
    is_following: bool
    recent_activities: list[UserActivitySummary]


class FollowerListItem(BaseModel):
    username: str
    full_name: str
    avatar_color: str
    bio: str | None
    is_following: bool


class FollowerListResponse(BaseModel):
    items: list[FollowerListItem]
    total: int
    skip: int
    limit: int
