from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Float, ForeignKey, Index, String, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.mixins import TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User


class Goal(Base, TimestampMixin):
    __tablename__ = "goals"
    __table_args__ = (
        Index("idx_goals_user_id", "user_id"),
        Index("idx_goals_user_active", "user_id", "is_active"),
        # Partial unique index — only one active goal per user at a time
        Index(
            "idx_goals_one_active_per_user",
            "user_id",
            unique=True,
            postgresql_where=text("is_active = true"),
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
    )
    # Values: weight_loss / weight_gain / muscle_gain / maintenance (validated at app layer)
    goal_type: Mapped[str] = mapped_column(String(20))
    # NULL when goal_type = maintenance
    target_weight_kg: Mapped[float | None] = mapped_column(Float)
    # Service layer deactivates all existing goals before activating a new one
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # ── Relationships ────────────────────────────────────────────────────────
    user: Mapped[User] = relationship("User", back_populates="goals")
