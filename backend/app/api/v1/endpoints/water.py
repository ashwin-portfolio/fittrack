import uuid
from datetime import date as date_cls

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user, get_db
from app.models.user import User
from app.schemas.water import (
    WaterDailySummaryResponse,
    WaterGoalRequest,
    WaterGoalResponse,
    WaterLogRequest,
    WaterLogResponse,
)
from app.services.water_service import water_service

router = APIRouter()

# ── Literal routes FIRST — before /{entry_id} ─────────────────────────────────


@router.get("/daily-summary", response_model=WaterDailySummaryResponse)
def get_daily_summary(
    date: date_cls | None = Query(default=None, description="YYYY-MM-DD, defaults to today"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    target = date or date_cls.today()
    return water_service.daily_summary(db, current_user, target)


@router.get("/goal", response_model=WaterGoalResponse)
def get_goal(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return water_service.get_goal(db, current_user)


@router.put("/goal", response_model=WaterGoalResponse)
def set_goal(
    body: WaterGoalRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return water_service.set_goal(db, current_user, body)


@router.post("", response_model=WaterLogResponse, status_code=201)
def log_water(
    body: WaterLogRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return water_service.log_water(db, current_user, body)


@router.delete("/{entry_id}", status_code=204)
def delete_water(
    entry_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    water_service.delete(db, current_user, entry_id)
