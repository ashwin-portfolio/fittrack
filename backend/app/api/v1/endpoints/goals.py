from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user, get_db
from app.models.user import User
from app.schemas.goal import GoalCreateRequest, GoalResponse
from app.services.goal_service import goal_service

router = APIRouter()

# Literal /active route must come before any parameterized routes


@router.get("/active", response_model=GoalResponse)
def get_active_goal(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return goal_service.get_active(db, current_user)


@router.post("", response_model=GoalResponse, status_code=201)
def create_goal(
    body: GoalCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return goal_service.create(db, current_user, body)
