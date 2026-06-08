from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, CheckConstraint, DateTime, ForeignKey, Index, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.mixins import SoftDeleteMixin

if TYPE_CHECKING:
    from app.models.nutrition import NutritionEntry
    from app.models.social import Comment, Kudos
    from app.models.user import User
    from app.models.weight import WeightLog
    from app.models.workout import WorkoutSession


class ActivityFeedItem(Base, SoftDeleteMixin):
    __tablename__ = "activity_feed_items"
    __table_args__ = (
        Index("idx_feed_public_created", "is_public", "created_at"),
        Index("idx_feed_user_created", "user_id", "created_at"),
        Index("idx_feed_type", "activity_type"),
        Index("idx_feed_deleted", "deleted_at"),
        # Exactly one source FK must be non-null — also enforced at service layer
        CheckConstraint(
            "(workout_session_id IS NOT NULL)::int + "
            "(nutrition_entry_id IS NOT NULL)::int + "
            "(weight_log_id IS NOT NULL)::int = 1",
            name="ck_feed_items_exactly_one_source",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
    )
    # Values: workout / meal / weight  (validated at app layer)
    activity_type: Mapped[str] = mapped_column(String(20))
    workout_session_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("workout_sessions.id", ondelete="CASCADE"),
    )
    nutrition_entry_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("nutrition_entries.id", ondelete="CASCADE"),
    )
    weight_log_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("weight_logs.id", ondelete="CASCADE"),
    )
    is_public: Mapped[bool] = mapped_column(Boolean, default=True)
    # No updated_at — feed items are immutable after creation
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    # ── Relationships ────────────────────────────────────────────────────────
    user: Mapped[User] = relationship("User", back_populates="activity_feed_items")
    workout_session: Mapped[WorkoutSession | None] = relationship("WorkoutSession")
    nutrition_entry: Mapped[NutritionEntry | None] = relationship("NutritionEntry")
    weight_log: Mapped[WeightLog | None] = relationship("WeightLog")
    kudos: Mapped[list[Kudos]] = relationship(
        "Kudos",
        back_populates="feed_item",
        cascade="all, delete-orphan",
    )
    comments: Mapped[list[Comment]] = relationship(
        "Comment",
        back_populates="feed_item",
        cascade="all, delete-orphan",
        order_by="Comment.created_at",
    )
