from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.core.limiter import limiter
from app.models.user import User
from app.schemas.auth import (
    AccessTokenResponse,
    ForgotPasswordRequest,
    LoginRequest,
    LogoutRequest,
    LogoutResponse,
    MessageResponse,
    RefreshRequest,
    RegisterRequest,
    RegisterResponse,
    ResetPasswordRequest,
    TokenResponse,
)
from app.services.auth_service import auth_service

router = APIRouter()


@router.post("/register", response_model=RegisterResponse, status_code=201)
@limiter.limit("10/minute")
async def register(request: Request, body: RegisterRequest, db: Session = Depends(get_db)):
    return auth_service.register(db, body)


@router.post("/login", response_model=TokenResponse)
@limiter.limit("10/minute")
async def login(request: Request, body: LoginRequest, db: Session = Depends(get_db)):
    return auth_service.login(db, body)


@router.post("/refresh", response_model=AccessTokenResponse)
@limiter.limit("30/minute")
async def refresh(request: Request, body: RefreshRequest, db: Session = Depends(get_db)):
    return auth_service.refresh_token(db, body.refresh_token)


@router.post("/logout", response_model=LogoutResponse)
async def logout(
    body: LogoutRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return auth_service.logout(db, body.refresh_token)


@router.post("/forgot-password", response_model=MessageResponse)
@limiter.limit("5/minute")
async def forgot_password(request: Request, body: ForgotPasswordRequest, db: Session = Depends(get_db)):
    return auth_service.forgot_password(db, body)


@router.post("/reset-password", response_model=MessageResponse)
@limiter.limit("10/minute")
async def reset_password(request: Request, body: ResetPasswordRequest, db: Session = Depends(get_db)):
    return auth_service.reset_password(db, body)


@router.get("/verify-email", response_model=MessageResponse)
async def verify_email(token: str, db: Session = Depends(get_db)):
    return auth_service.verify_email(db, token)


@router.post("/resend-verification", response_model=MessageResponse)
@limiter.limit("3/minute")
async def resend_verification(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return auth_service.resend_verification(db, current_user)
