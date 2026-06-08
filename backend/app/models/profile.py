from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Float, ForeignKey, Index, SmallInteger, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.mixins import TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User


class Profile(Base, TimestampMixin):
    __tablename__ = "profiles"
    __table_args__ = (
        Index("idx_profiles_user_id", "user_id", unique=True),
        Index("idx_profiles_public", "is_public"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    # One-to-one: unique constraint enforced here and via index above
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
    )
    full_name: Mapped[str] = mapped_column(String(100))
    age: Mapped[int | None] = mapped_column(SmallInteger)
    # Values: male / female / other / prefer_not_to_say  (validated at app layer)
    gender: Mapped[str | None] = mapped_column(String(20))
    height_cm: Mapped[float | None] = mapped_column(Float)
    bio: Mapped[str | None] = mapped_column(String(160))
    is_public: Mapped[bool] = mapped_column(Boolean, default=True)
    # Hex color derived deterministically from username at registration
    avatar_color: Mapped[str] = mapped_column(String(7))
    onboarding_complete: Mapped[bool] = mapped_column(Boolean, default=False)

    # ── Relationships ────────────────────────────────────────────────────────
    user: Mapped[User] = relationship("User", back_populates="profile")
