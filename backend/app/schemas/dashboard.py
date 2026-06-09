from __future__ import annotations

from datetime import date, datetime

from pydantic import BaseModel


class ActivityItem(BaseModel):
    type: str  # "workout" | "meal" | "weight"
    label: str
    occurred_at: datetime


class DashboardSummaryResponse(BaseModel):
    current_weight_kg: float | None
    target_weight_kg: float | None
    weight_change_kg: float | None
    workouts_this_week: int
    calories_today: float
    protein_today_g: float
    recent_activities: list[ActivityItem]


class WeightDataPoint(BaseModel):
    date: date
    weight_kg: float


class WeightChartResponse(BaseModel):
    data: list[WeightDataPoint]


class WorkoutWeekPoint(BaseModel):
    week: str   # e.g. "Dec 23"
    count: int


class WorkoutsChartResponse(BaseModel):
    data: list[WorkoutWeekPoint]


class CaloriesDataPoint(BaseModel):
    date: date
    calories: float


class CaloriesChartResponse(BaseModel):
    data: list[CaloriesDataPoint]
