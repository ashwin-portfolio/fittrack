from __future__ import annotations

import uuid
from datetime import date
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Date, Float, ForeignKey, Index, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.mixins import SoftDeleteMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User


class WeightLog(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "weight_logs"
    __table_args__ = (
        # Partial unique index: one active (non-deleted) entry per user per day.
        # Allows re-logging after a soft delete on the same date.
        Index(
            "idx_weight_logs_user_date",
            "user_id",
            "log_date",
            unique=True,
            postgresql_where=text("deleted_at IS NULL"),
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
    )
    log_date: Mapped[date] = mapped_column(Date)
    weight_kg: Mapped[float] = mapped_column(Float)
    is_shared: Mapped[bool] = mapped_column(Boolean, default=False)

    # ── Relationships ────────────────────────────────────────────────────────
    user: Mapped[User] = relationship("User", back_populates="weight_logs")
