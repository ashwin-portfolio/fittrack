from __future__ import annotations

import uuid
from datetime import date
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Date, Float, ForeignKey, Index, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.mixins import SoftDeleteMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User


class NutritionEntry(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "nutrition_entries"
    __table_args__ = (
        Index("idx_nutrition_user_date", "user_id", "entry_date"),
        Index("idx_nutrition_shared", "is_shared"),
        Index("idx_nutrition_deleted", "deleted_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
    )
    entry_date: Mapped[date] = mapped_column(Date)
    # Values: breakfast / lunch / dinner / snack  (validated at app layer)
    meal_type: Mapped[str] = mapped_column(String(20))
    food_name: Mapped[str] = mapped_column(String(200))
    calories: Mapped[float] = mapped_column(Float)
    protein_g: Mapped[float | None] = mapped_column(Float)
    carbs_g: Mapped[float | None] = mapped_column(Float)
    fat_g: Mapped[float | None] = mapped_column(Float)
    # Reserved for Phase 2 barcode scanning — not exposed in MVP API
    barcode: Mapped[str | None] = mapped_column(String(50))
    food_db_ref_id: Mapped[uuid.UUID | None] = mapped_column()
    is_shared: Mapped[bool] = mapped_column(Boolean, default=False)

    # ── Relationships ────────────────────────────────────────────────────────
    user: Mapped[User] = relationship("User", back_populates="nutrition_entries")
