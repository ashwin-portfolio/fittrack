from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user, get_db
from app.models.user import User
from app.schemas.dashboard import (
    CaloriesChartResponse,
    DashboardSummaryResponse,
    WeightChartResponse,
    WorkoutsChartResponse,
)
from app.services.dashboard_service import dashboard_service

router = APIRouter()


@router.get("/summary", response_model=DashboardSummaryResponse)
def get_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return dashboard_service.summary(db, current_user)


@router.get("/charts/weight", response_model=WeightChartResponse)
def weight_chart(
    days: int = Query(default=30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return dashboard_service.weight_chart(db, current_user, days=days)


@router.get("/charts/workouts", response_model=WorkoutsChartResponse)
def workouts_chart(
    weeks: int = Query(default=4, ge=1, le=52),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return dashboard_service.workouts_chart(db, current_user, weeks=weeks)


@router.get("/charts/calories", response_model=CaloriesChartResponse)
def calories_chart(
    days: int = Query(default=7, ge=1, le=90),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return dashboard_service.calories_chart(db, current_user, days=days)
