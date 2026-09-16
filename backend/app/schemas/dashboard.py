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
    # None when no weight is on record, or no session this week has a
    # duration — an estimate needs both.
    calories_burned_this_week: float | None
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


# Named "digest" rather than WeeklySummaryResponse because
# app/schemas/nutrition.py already has a WeeklySummaryResponse — the
# calorie-only one behind /nutrition/weekly-summary. This is the wider
# cross-feature roll-up behind /dashboard/weekly-summary.
class WeeklyDigestResponse(BaseModel):
    week_start: date
    week_end: date

    workouts_completed: int
    # Only set when the active goal is a workout_frequency goal, matching
    # /goals/workout-progress.
    workout_goal: int | None

    calories_consumed: float
    # None when nothing this week is estimable (no duration, or no body weight).
    calories_burned: float | None
    # None whenever burned is None — "net" is a claim about both sides, and
    # falling back to consumed alone would silently mislabel it.
    net_calories: float | None

    # vs. the last weigh-in on or before 7 days ago.
    weight_delta_kg: float | None

    workout_streak: int
    nutrition_streak: int


class CaloriesDataPoint(BaseModel):
    date: date
    calories: float


class CaloriesChartResponse(BaseModel):
    data: list[CaloriesDataPoint]
