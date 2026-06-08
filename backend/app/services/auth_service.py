from __future__ import annotations

from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import (
    create_access_token,
    generate_refresh_token,
    hash_password,
    hash_token,
    verify_password,
)
from app.core.config import settings
from app.models.user import User
from app.repositories.profile_repository import profile_repo
from app.repositories.refresh_token_repository import refresh_token_repo
from app.repositories.user_repository import user_repo
from app.schemas.auth import (
    AccessTokenResponse,
    LoginRequest,
    LogoutResponse,
    RegisterRequest,
    RegisterResponse,
    TokenResponse,
    UserPublic,
)


class AuthService:
    def register(self, db: Session, body: RegisterRequest) -> RegisterResponse:
        if user_repo.get_by_email(db, body.email):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
        if user_repo.get_by_username(db, body.username):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already taken")

        user = user_repo.create(
            db,
            email=body.email,
            username=body.username,
            hashed_password=hash_password(body.password),
        )
        profile_repo.create(
            db,
            user_id=user.id,
            full_name=body.display_name,
            username=body.username,
        )
        # No explicit db.commit() — get_db() commits after the route returns.

        return RegisterResponse(
            message="Account created successfully",
            user=UserPublic.model_validate(user),
        )

    def login(self, db: Session, body: LoginRequest) -> TokenResponse:
        user = user_repo.get_by_email(db, body.email)
        if not user or not verify_password(body.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )
        if not user.is_active:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is deactivated")

        access_token = create_access_token(str(user.id))
        raw_refresh, token_hash, expires_at = self._issue_refresh_token(db, user)

        return TokenResponse(
            access_token=access_token,
            refresh_token=raw_refresh,
            user=UserPublic.model_validate(user),
        )

    def refresh_token(self, db: Session, raw_token: str) -> AccessTokenResponse:
        token_hash = hash_token(raw_token)
        rt = refresh_token_repo.get_by_hash(db, token_hash)

        if rt is None or rt.revoked_at is not None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token invalid or revoked")
        if rt.expires_at < datetime.now(timezone.utc):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token expired")

        access_token = create_access_token(str(rt.user_id))
        return AccessTokenResponse(access_token=access_token)

    def logout(self, db: Session, raw_token: str) -> LogoutResponse:
        token_hash = hash_token(raw_token)
        refresh_token_repo.revoke(db, token_hash)
        return LogoutResponse(message="Logged out successfully")

    # ── Helpers ───────────────────────────────────────────────────────────────

    def _issue_refresh_token(
        self, db: Session, user: User
    ) -> tuple[str, str, datetime]:
        raw = generate_refresh_token()
        token_hash = hash_token(raw)
        expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        refresh_token_repo.create(db, user_id=user.id, token_hash=token_hash, expires_at=expires_at)
        return raw, token_hash, expires_at


auth_service = AuthService()
