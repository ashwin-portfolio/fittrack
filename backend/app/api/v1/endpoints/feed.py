from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user, get_db
from app.models.user import User
from app.schemas.social import FeedListResponse
from app.services.feed_service import feed_service

router = APIRouter()


@router.get("/global", response_model=FeedListResponse)
def global_feed(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=50),
    type: str | None = Query(default=None, description="workout | meal | weight"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return feed_service.global_feed(
        db, current_user, skip=skip, limit=limit, activity_type=type
    )


@router.get("/following", response_model=FeedListResponse)
def following_feed(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=50),
    type: str | None = Query(default=None, description="workout | meal | weight"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return feed_service.following_feed(
        db, current_user, skip=skip, limit=limit, activity_type=type
    )
