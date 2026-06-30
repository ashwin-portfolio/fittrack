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
from app.core.email import send_password_reset_email, send_verification_email
from app.models.user import User
from app.repositories.auth_token_repository import auth_token_repo
from app.repositories.profile_repository import profile_repo
from app.repositories.refresh_token_repository import refresh_token_repo
from app.repositories.user_repository import user_repo
from app.schemas.auth import (
    AccessTokenResponse,
    ForgotPasswordRequest,
    LoginRequest,
    LogoutResponse,
    MessageResponse,
    RegisterRequest,
    RegisterResponse,
    ResetPasswordRequest,
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
        # Send verification email — token is flushed to DB before email is sent.
        # If email fails, the exception propagates and get_db() rolls back the transaction.
        self._send_verification_email(db, user)

        return RegisterResponse(
            message="Account created successfully. Check your email to verify your address.",
            user=UserPublic.model_validate(user),
        )

    def login(self, db: Session, body: LoginRequest) -> TokenResponse:
        identifier = body.identifier.strip().lower()
        if "@" in identifier:
            user = user_repo.get_by_email(db, identifier)
        else:
            user = user_repo.get_by_username(db, identifier)
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

    def forgot_password(self, db: Session, body: ForgotPasswordRequest) -> MessageResponse:
        user = user_repo.get_by_email(db, body.email)
        # Always return the same message to avoid revealing whether an email exists
        if user and user.is_active:
            token = auth_token_repo.create_token(db, user.id, "password_reset", timedelta(hours=1))
            send_password_reset_email(user.email, token)
        return MessageResponse(message="If your email is registered, you will receive a password reset link shortly.")

    def reset_password(self, db: Session, body: ResetPasswordRequest) -> MessageResponse:
        token_hash = hash_token(body.token)
        auth_token = auth_token_repo.get_valid_token(db, token_hash, "password_reset")
        if not auth_token:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Reset link is invalid or has expired.")
        user = user_repo.get_by_id(db, auth_token.user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Reset link is invalid or has expired.")
        user_repo.update_password(db, user, hash_password(body.new_password))
        auth_token_repo.mark_used(db, auth_token)
        return MessageResponse(message="Password updated successfully.")

    def verify_email(self, db: Session, token: str) -> MessageResponse:
        token_hash = hash_token(token)
        auth_token = auth_token_repo.get_valid_token(db, token_hash, "email_verification")
        if not auth_token:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Verification link is invalid or has expired.")
        user = user_repo.get_by_id(db, auth_token.user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Verification link is invalid or has expired.")
        user_repo.set_email_verified(db, user)
        auth_token_repo.mark_used(db, auth_token)
        return MessageResponse(message="Email verified successfully.")

    def resend_verification(self, db: Session, current_user: User) -> MessageResponse:
        if current_user.is_email_verified:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email is already verified.")
        self._send_verification_email(db, current_user)
        return MessageResponse(message="Verification email sent.")

    # ── Helpers ───────────────────────────────────────────────────────────────

    def _send_verification_email(self, db: Session, user: User) -> None:
        token = auth_token_repo.create_token(db, user.id, "email_verification", timedelta(hours=24))
        send_verification_email(user.email, token)

    def _issue_refresh_token(
        self, db: Session, user: User
    ) -> tuple[str, str, datetime]:
        raw = generate_refresh_token()
        token_hash = hash_token(raw)
        expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        refresh_token_repo.create(db, user_id=user.id, token_hash=token_hash, expires_at=expires_at)
        return raw, token_hash, expires_at


auth_service = AuthService()
