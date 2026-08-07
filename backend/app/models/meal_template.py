from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Float, ForeignKey, Index, SmallInteger, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.mixins import TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User


class MealTemplate(Base, TimestampMixin):
    __tablename__ = "meal_templates"
    __table_args__ = (
        Index("idx_meal_templates_user_id", "user_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
    )
    name: Mapped[str] = mapped_column(String(100))
    # Values: breakfast / lunch / dinner / snack (validated at app layer)
    meal_type: Mapped[str] = mapped_column(String(20))

    # ── Relationships ────────────────────────────────────────────────────────
    user: Mapped[User] = relationship("User", back_populates="meal_templates")
    items: Mapped[list[MealTemplateItem]] = relationship(
        "MealTemplateItem",
        back_populates="template",
        cascade="all, delete-orphan",
        order_by="MealTemplateItem.order_index",
    )


class MealTemplateItem(Base, TimestampMixin):
    __tablename__ = "meal_template_items"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    template_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("meal_templates.id", ondelete="CASCADE"),
    )
    food_name: Mapped[str] = mapped_column(String(200))
    calories: Mapped[float] = mapped_column(Float)
    protein_g: Mapped[float | None] = mapped_column(Float)
    carbs_g: Mapped[float | None] = mapped_column(Float)
    fat_g: Mapped[float | None] = mapped_column(Float)
    order_index: Mapped[int] = mapped_column(SmallInteger, default=0)

    # ── Relationships ────────────────────────────────────────────────────────
    template: Mapped[MealTemplate] = relationship("MealTemplate", back_populates="items")
