from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user, get_db
from app.models.user import User
from app.schemas.social import (
    FollowerListResponse,
    UserListResponse,
    UserProfileResponse,
)
from app.services.social_service import social_service

router = APIRouter()

# Literal paths before parameterized — /search would go here if we had one


@router.get("", response_model=UserListResponse)
def list_users(
    q: str | None = Query(default=None, description="Search by username or name"),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return social_service.list_users(db, current_user, q=q, skip=skip, limit=limit)


@router.get("/{username}", response_model=UserProfileResponse)
def get_user_profile(
    username: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return social_service.get_user_profile(db, current_user, username)


@router.get("/{username}/followers", response_model=FollowerListResponse)
def list_followers(
    username: str,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return social_service.list_followers(db, current_user, username, skip=skip, limit=limit)


@router.get("/{username}/following", response_model=FollowerListResponse)
def list_following(
    username: str,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return social_service.list_following(db, current_user, username, skip=skip, limit=limit)
