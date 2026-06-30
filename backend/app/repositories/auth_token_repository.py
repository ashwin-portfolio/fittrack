from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import generate_refresh_token, hash_token
from app.models.auth_token import AuthToken


class AuthTokenRepository:
    def create_token(
        self,
        db: Session,
        user_id: uuid.UUID,
        purpose: str,
        expires_in: timedelta,
    ) -> str:
        """Generate, store (hashed), and return the raw token for use in email links."""
        raw = generate_refresh_token()
        record = AuthToken(
            user_id=user_id,
            token_hash=hash_token(raw),
            purpose=purpose,
            expires_at=datetime.now(timezone.utc) + expires_in,
        )
        db.add(record)
        db.flush()
        return raw

    def get_valid_token(
        self, db: Session, token_hash: str, purpose: str
    ) -> AuthToken | None:
        now = datetime.now(timezone.utc)
        return db.scalar(
            select(AuthToken).where(
                AuthToken.token_hash == token_hash,
                AuthToken.purpose == purpose,
                AuthToken.used_at.is_(None),
                AuthToken.expires_at > now,
            )
        )

    def mark_used(self, db: Session, token: AuthToken) -> None:
        token.used_at = datetime.now(timezone.utc)
        db.flush()


auth_token_repo = AuthTokenRepository()
