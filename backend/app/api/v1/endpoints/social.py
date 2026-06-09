import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user, get_db
from app.models.user import User
from app.schemas.social import (
    CommentCreateRequest,
    CommentListResponse,
    CommentResponse,
    KudosResponse,
)
from app.services.social_service import social_service

router = APIRouter()


# ── Kudos ─────────────────────────────────────────────────────────────────────

@router.post("/kudos/{feed_item_id}", response_model=KudosResponse)
def give_kudos(
    feed_item_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return social_service.give_kudos(db, current_user, feed_item_id)


@router.delete("/kudos/{feed_item_id}", response_model=KudosResponse)
def remove_kudos(
    feed_item_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return social_service.remove_kudos(db, current_user, feed_item_id)


# ── Comments ──────────────────────────────────────────────────────────────────

@router.get("/comments/{feed_item_id}", response_model=CommentListResponse)
def list_comments(
    feed_item_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return social_service.list_comments(db, current_user, feed_item_id)


@router.post("/comments/{feed_item_id}", response_model=CommentResponse, status_code=201)
def add_comment(
    feed_item_id: uuid.UUID,
    body: CommentCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return social_service.add_comment(db, current_user, feed_item_id, body)


@router.delete("/comments/{comment_id}", status_code=204)
def delete_comment(
    comment_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    social_service.delete_comment(db, current_user, comment_id)
