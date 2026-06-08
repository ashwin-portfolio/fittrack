from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user, get_db
from app.core.constants import MuscleGroup
from app.models.user import User
from app.schemas.exercise import ExerciseCreateRequest, ExerciseListResponse, ExerciseResponse
from app.services.exercise_service import exercise_service

router = APIRouter()


@router.get("", response_model=ExerciseListResponse)
def list_exercises(
    muscle_group: MuscleGroup | None = Query(default=None, description="Filter by muscle group"),
    search: str | None = Query(default=None, max_length=100, description="Search by name"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return exercise_service.list_exercises(
        db, current_user, muscle_group=muscle_group, search=search
    )


@router.post("", response_model=ExerciseResponse, status_code=201)
def create_exercise(
    body: ExerciseCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return exercise_service.create_exercise(db, current_user, body)
