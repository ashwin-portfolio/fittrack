from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, ForeignKey, Index, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.mixins import SoftDeleteMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.feed import ActivityFeedItem
    from app.models.user import User


class Kudos(Base, TimestampMixin):
    __tablename__ = "kudos"
    __table_args__ = (
        Index("idx_kudos_user_item", "user_id", "feed_item_id", unique=True),
        Index("idx_kudos_feed_item", "feed_item_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
    )
    feed_item_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("activity_feed_items.id", ondelete="CASCADE"),
    )

    # ── Relationships ────────────────────────────────────────────────────────
    user: Mapped[User] = relationship("User", back_populates="kudos")
    feed_item: Mapped[ActivityFeedItem] = relationship(
        "ActivityFeedItem",
        back_populates="kudos",
    )


class Comment(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "comments"
    __table_args__ = (
        Index("idx_comments_feed_item", "feed_item_id", "created_at"),
        Index("idx_comments_deleted", "deleted_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
    )
    feed_item_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("activity_feed_items.id", ondelete="CASCADE"),
    )
    # Max 500 chars enforced at app layer, not at DB level
    content: Mapped[str] = mapped_column(Text)

    # ── Relationships ────────────────────────────────────────────────────────
    user: Mapped[User] = relationship("User", back_populates="comments")
    feed_item: Mapped[ActivityFeedItem] = relationship(
        "ActivityFeedItem",
        back_populates="comments",
    )


class Follow(Base, TimestampMixin):
    __tablename__ = "follows"
    __table_args__ = (
        Index("idx_follows_pair", "follower_id", "following_id", unique=True),
        Index("idx_follows_follower", "follower_id"),
        Index("idx_follows_following", "following_id"),
        CheckConstraint(
            "follower_id != following_id",
            name="ck_follows_no_self_follow",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    # Who is doing the following
    follower_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
    )
    # Who is being followed
    following_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
    )

    # ── Relationships ────────────────────────────────────────────────────────
    # foreign_keys required: two FKs point at the same table
    follower: Mapped[User] = relationship(
        "User",
        back_populates="follows_given",
        foreign_keys="[Follow.follower_id]",
    )
    followed: Mapped[User] = relationship(
        "User",
        back_populates="follows_received",
        foreign_keys="[Follow.following_id]",
    )
