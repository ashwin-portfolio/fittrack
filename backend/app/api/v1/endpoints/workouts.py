import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user, get_db
from app.models.user import User
from app.schemas.template import SaveAsTemplateRequest, TemplateResponse
from app.schemas.workout import (
    ExerciseHistoryResponse,
    LoggedExercisesResponse,
    PersonalRecordsResponse,
    WorkoutCreateRequest,
    WorkoutListResponse,
    WorkoutResponse,
)
from app.services.template_service import template_service
from app.services.workout_service import workout_service

router = APIRouter()


@router.post("", response_model=WorkoutResponse, status_code=201)
def create_workout(
    body: WorkoutCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return workout_service.create_workout(db, current_user, body)


@router.get("", response_model=WorkoutListResponse)
def list_workouts(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return workout_service.list_workouts(db, current_user, limit=limit, offset=offset)


@router.get("/personal-records", response_model=PersonalRecordsResponse)
def get_personal_records(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return workout_service.personal_records(db, current_user)


@router.get("/logged-exercises", response_model=LoggedExercisesResponse)
def get_logged_exercises(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return workout_service.logged_exercises(db, current_user)


@router.get("/exercise-history/{exercise_id}", response_model=ExerciseHistoryResponse)
def get_exercise_history(
    exercise_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return workout_service.exercise_history(db, current_user, exercise_id)


@router.get("/{workout_id}", response_model=WorkoutResponse)
def get_workout(
    workout_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return workout_service.get_workout(db, current_user, workout_id)


@router.patch("/{workout_id}", response_model=WorkoutResponse)
def update_workout(
    workout_id: uuid.UUID,
    body: WorkoutCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return workout_service.update_workout(db, current_user, workout_id, body)


@router.post("/{workout_id}/save-as-template", response_model=TemplateResponse, status_code=201)
def save_as_template(
    workout_id: uuid.UUID,
    body: SaveAsTemplateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return template_service.save_workout_as_template(db, current_user, workout_id, body)


@router.delete("/{workout_id}", status_code=204)
def delete_workout(
    workout_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    workout_service.delete_workout(db, current_user, workout_id)
