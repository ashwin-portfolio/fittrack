from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Index, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.mixins import TimestampMixin

if TYPE_CHECKING:
    from app.models.exercise import Exercise
    from app.models.feed import ActivityFeedItem
    from app.models.goal import Goal
    from app.models.nutrition import NutritionEntry
    from app.models.profile import Profile
    from app.models.refresh_token import RefreshToken
    from app.models.social import Comment, Follow, Kudos
    from app.models.weight import WeightLog
    from app.models.workout import WorkoutSession


class User(Base, TimestampMixin):
    __tablename__ = "users"
    __table_args__ = (
        Index("idx_users_email", "email", unique=True),
        Index("idx_users_username", "username", unique=True),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255))
    username: Mapped[str] = mapped_column(String(20))
    hashed_password: Mapped[str] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # ── Relationships ────────────────────────────────────────────────────────
    profile: Mapped[Profile] = relationship(
        "Profile",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )
    goals: Mapped[list[Goal]] = relationship(
        "Goal",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    refresh_tokens: Mapped[list[RefreshToken]] = relationship(
        "RefreshToken",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    exercises: Mapped[list[Exercise]] = relationship(
        "Exercise",
        back_populates="creator",
        foreign_keys="[Exercise.created_by_user_id]",
    )
    workout_sessions: Mapped[list[WorkoutSession]] = relationship(
        "WorkoutSession",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    nutrition_entries: Mapped[list[NutritionEntry]] = relationship(
        "NutritionEntry",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    weight_logs: Mapped[list[WeightLog]] = relationship(
        "WeightLog",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    activity_feed_items: Mapped[list[ActivityFeedItem]] = relationship(
        "ActivityFeedItem",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    kudos: Mapped[list[Kudos]] = relationship(
        "Kudos",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    comments: Mapped[list[Comment]] = relationship(
        "Comment",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    # Follows where this user is the follower (people I follow)
    follows_given: Mapped[list[Follow]] = relationship(
        "Follow",
        back_populates="follower",
        foreign_keys="[Follow.follower_id]",
        cascade="all, delete-orphan",
    )
    # Follows where this user is being followed (my followers)
    follows_received: Mapped[list[Follow]] = relationship(
        "Follow",
        back_populates="followed",
        foreign_keys="[Follow.following_id]",
        cascade="all, delete-orphan",
    )
