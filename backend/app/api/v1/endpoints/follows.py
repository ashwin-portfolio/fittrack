from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user, get_db
from app.models.user import User
from app.schemas.social import FollowResponse
from app.services.social_service import social_service

router = APIRouter()


@router.post("/{username}", response_model=FollowResponse)
def follow_user(
    username: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return social_service.follow(db, current_user, username)


@router.delete("/{username}", response_model=FollowResponse)
def unfollow_user(
    username: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return social_service.unfollow(db, current_user, username)
