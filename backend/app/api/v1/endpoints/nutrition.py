import uuid
from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user, get_db
from app.models.user import User
from app.schemas.nutrition import (
    DailySummaryResponse,
    NutritionCreateRequest,
    NutritionListResponse,
    NutritionResponse,
)
from app.services.nutrition_service import nutrition_service

router = APIRouter()

# IMPORTANT: /daily-summary must be registered before /{id}
# FastAPI matches top-to-bottom — if /{id} comes first, "daily-summary"
# is parsed as a UUID and returns 422.


@router.get("/daily-summary", response_model=DailySummaryResponse)
def get_daily_summary(
    date: date = Query(default=None, description="Date (YYYY-MM-DD), defaults to today"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    target = date or __import__("datetime").date.today()
    return nutrition_service.daily_summary(db, current_user, target)


@router.get("", response_model=NutritionListResponse)
def list_entries(
    date: date | None = Query(default=None, description="Filter by date (YYYY-MM-DD)"),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return nutrition_service.list_entries(
        db, current_user, entry_date=date, skip=skip, limit=limit
    )


@router.post("", response_model=NutritionResponse, status_code=201)
def create_entry(
    body: NutritionCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return nutrition_service.create_entry(db, current_user, body)


@router.delete("/{entry_id}", status_code=204)
def delete_entry(
    entry_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    nutrition_service.delete_entry(db, current_user, entry_id)
