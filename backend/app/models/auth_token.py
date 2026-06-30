from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Index, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.mixins import TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User


class AuthToken(Base, TimestampMixin):
    """Stores hashed tokens for password reset and email verification.

    purpose: 'password_reset' | 'email_verification'
    used_at: NULL = unused; set to now() on consumption (single-use)
    """
    __tablename__ = "auth_tokens"
    __table_args__ = (
        Index("idx_auth_tokens_hash", "token_hash", unique=True),
        Index("idx_auth_tokens_user", "user_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    token_hash: Mapped[str] = mapped_column(String(64))
    purpose: Mapped[str] = mapped_column(String(30))
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    user: Mapped[User] = relationship("User")
