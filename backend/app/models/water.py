from __future__ import annotations

import uuid
from datetime import date
from typing import TYPE_CHECKING

from sqlalchemy import Date, ForeignKey, Index, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.mixins import TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User


class WaterLog(Base, TimestampMixin):
    __tablename__ = "water_logs"
    __table_args__ = (
        Index("idx_water_logs_user_date", "user_id", "log_date"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
    )
    log_date: Mapped[date] = mapped_column(Date)
    amount_ml: Mapped[int] = mapped_column(Integer)

    # ── Relationships ────────────────────────────────────────────────────────
    user: Mapped[User] = relationship("User", back_populates="water_logs")


class WaterGoal(Base, TimestampMixin):
    __tablename__ = "water_goals"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), unique=True
    )
    daily_target_ml: Mapped[int] = mapped_column(Integer, default=2000)
