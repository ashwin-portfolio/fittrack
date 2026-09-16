from __future__ import annotations

from datetime import date, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.goal import Goal
from app.models.nutrition import NutritionEntry
from app.models.user import User
from app.models.weight import WeightLog
from app.models.workout import WorkoutExercise, WorkoutSession
from app.services.workout_service import workout_service
from app.repositories.goal_repository import goal_repo
from app.repositories.workout_repository import workout_repo
from app.repositories.nutrition_repository import nutrition_repo
from app.repositories.weight_repository import weight_repo
from app.schemas.dashboard import (
    ActivityItem,
    CaloriesChartResponse,
    CaloriesDataPoint,
    DashboardSummaryResponse,
    WeightChartResponse,
    WeightDataPoint,
    WeeklyDigestResponse,
    WorkoutWeekPoint,
    WorkoutsChartResponse,
)
from app.services.nutrition_service import nutrition_service


class DashboardService:
    def weekly_digest(self, db: Session, user: User) -> WeeklyDigestResponse:
        today = date.today()
        week_start = today - timedelta(days=today.weekday())   # Monday
        week_end = week_start + timedelta(days=6)              # Sunday

        # ── Workouts vs. goal ────────────────────────────────────────────────
        workouts_completed = workout_repo.count_this_week(db, user.id)
        goal = goal_repo.get_active(db, user.id)
        workout_goal = (
            goal.weekly_workout_target
            if goal and goal.goal_type == "workout_frequency"
            else None
        )

        # ── Calories in and out ──────────────────────────────────────────────
        consumed_by_date = nutrition_repo.calories_by_date_range(
            db, user.id, week_start, week_end
        )
        calories_consumed = round(sum(consumed_by_date.values()), 1)
        calories_burned = workout_service.calories_burned_this_week(db, user)
        net_calories = (
            round(calories_consumed - calories_burned, 1)
            if calories_burned is not None
            else None
        )

        # ── Weight delta vs. a week ago ──────────────────────────────────────
        weight_delta_kg = None
        latest = weight_repo.get_latest(db, user.id)
        reference = weight_repo.get_latest_on_or_before(
            db, user.id, today - timedelta(days=7)
        )
        # A single entry is its own reference and would always report 0.0, which
        # reads as "no change" rather than "nothing to compare against".
        if latest and reference and latest.id != reference.id:
            weight_delta_kg = round(latest.weight_kg - reference.weight_kg, 2)

        # ── Active streaks ───────────────────────────────────────────────────
        workout_streak = workout_service.streak(db, user).current_streak
        nutrition_streak = nutrition_service.streak(db, user).current_streak

        return WeeklyDigestResponse(
            week_start=week_start,
            week_end=week_end,
            workouts_completed=workouts_completed,
            workout_goal=workout_goal,
            calories_consumed=calories_consumed,
            calories_burned=calories_burned,
            net_calories=net_calories,
            weight_delta_kg=weight_delta_kg,
            workout_streak=workout_streak,
            nutrition_streak=nutrition_streak,
        )

    def summary(self, db: Session, user: User) -> DashboardSummaryResponse:
        today = date.today()
        week_start = today - timedelta(days=today.weekday())  # Monday of current week
        thirty_ago = today - timedelta(days=30)

        # ── Current weight (latest ever) ──────────────────────────────────────
        latest_wl = db.scalar(
            select(WeightLog)
            .where(WeightLog.user_id == user.id, WeightLog.deleted_at.is_(None))
            .order_by(WeightLog.log_date.desc(), WeightLog.created_at.desc())
            .limit(1)
        )
        current_weight_kg = latest_wl.weight_kg if latest_wl else None

        # ── Weight change over last 30 days ───────────────────────────────────
        weight_change_kg = None
        entries_30d = db.scalars(
            select(WeightLog)
            .where(
                WeightLog.user_id == user.id,
                WeightLog.log_date >= thirty_ago,
                WeightLog.deleted_at.is_(None),
            )
            .order_by(WeightLog.log_date.asc())
        ).all()
        if len(entries_30d) >= 2:
            weight_change_kg = round(entries_30d[-1].weight_kg - entries_30d[0].weight_kg, 2)

        # ── Active goal → target weight ───────────────────────────────────────
        goal = db.scalar(
            select(Goal).where(Goal.user_id == user.id, Goal.is_active.is_(True))
        )
        target_weight_kg = goal.target_weight_kg if goal else None

        # ── Workouts this week ────────────────────────────────────────────────
        workouts_this_week = db.scalar(
            select(func.count(WorkoutSession.id)).where(
                WorkoutSession.user_id == user.id,
                WorkoutSession.session_date >= week_start,
                WorkoutSession.deleted_at.is_(None),
            )
        ) or 0

        # ── Nutrition today ───────────────────────────────────────────────────
        nutrition_row = db.execute(
            select(
                func.coalesce(func.sum(NutritionEntry.calories), 0.0).label("calories"),
                func.coalesce(func.sum(NutritionEntry.protein_g), 0.0).label("protein"),
            ).where(
                NutritionEntry.user_id == user.id,
                NutritionEntry.entry_date == today,
                NutritionEntry.deleted_at.is_(None),
            )
        ).one()

        return DashboardSummaryResponse(
            current_weight_kg=current_weight_kg,
            target_weight_kg=target_weight_kg,
            weight_change_kg=weight_change_kg,
            workouts_this_week=workouts_this_week,
            calories_today=nutrition_row.calories,
            protein_today_g=nutrition_row.protein,
            calories_burned_this_week=workout_service.calories_burned_this_week(db, user),
            recent_activities=self._recent_activities(db, user.id),
        )

    def _recent_activities(self, db: Session, user_id) -> list[ActivityItem]:
        workout_sessions = db.scalars(
            select(WorkoutSession)
            .where(WorkoutSession.user_id == user_id, WorkoutSession.deleted_at.is_(None))
            .order_by(WorkoutSession.created_at.desc())
            .limit(5)
        ).all()

        # Batch exercise counts (one query for all sessions)
        exercise_counts: dict = {}
        if workout_sessions:
            rows = db.execute(
                select(
                    WorkoutExercise.session_id,
                    func.count(WorkoutExercise.id).label("cnt"),
                )
                .where(WorkoutExercise.session_id.in_([w.id for w in workout_sessions]))
                .group_by(WorkoutExercise.session_id)
            ).all()
            exercise_counts = {r.session_id: r.cnt for r in rows}

        nutrition_entries = db.scalars(
            select(NutritionEntry)
            .where(NutritionEntry.user_id == user_id, NutritionEntry.deleted_at.is_(None))
            .order_by(NutritionEntry.created_at.desc())
            .limit(5)
        ).all()

        weight_logs = db.scalars(
            select(WeightLog)
            .where(WeightLog.user_id == user_id, WeightLog.deleted_at.is_(None))
            .order_by(WeightLog.created_at.desc())
            .limit(5)
        ).all()

        items: list[ActivityItem] = []
        for w in workout_sessions:
            cnt = exercise_counts.get(w.id, 0)
            plural = "s" if cnt != 1 else ""
            items.append(ActivityItem(
                type="workout",
                label=f"{w.name or 'Workout'} — {cnt} exercise{plural}",
                occurred_at=w.created_at,
            ))
        for n in nutrition_entries:
            items.append(ActivityItem(
                type="meal",
                label=f"{n.meal_type.title()} — {int(n.calories)} kcal",
                occurred_at=n.created_at,
            ))
        for wl in weight_logs:
            items.append(ActivityItem(
                type="weight",
                label=f"{wl.weight_kg} kg logged",
                occurred_at=wl.created_at,
            ))

        items.sort(key=lambda x: x.occurred_at, reverse=True)
        return items[:10]

    def weight_chart(self, db: Session, user: User, days: int = 30) -> WeightChartResponse:
        since = date.today() - timedelta(days=days)
        rows = db.execute(
            select(WeightLog.log_date, WeightLog.weight_kg)
            .where(
                WeightLog.user_id == user.id,
                WeightLog.log_date >= since,
                WeightLog.deleted_at.is_(None),
            )
            .order_by(WeightLog.log_date.asc())
        ).all()
        return WeightChartResponse(
            data=[WeightDataPoint(date=r.log_date, weight_kg=r.weight_kg) for r in rows]
        )

    def workouts_chart(self, db: Session, user: User, weeks: int = 4) -> WorkoutsChartResponse:
        today = date.today()
        this_monday = today - timedelta(days=today.weekday())
        mondays = [this_monday - timedelta(weeks=i) for i in range(weeks - 1, -1, -1)]
        since = mondays[0]

        rows = db.execute(
            select(WorkoutSession.session_date, func.count(WorkoutSession.id).label("cnt"))
            .where(
                WorkoutSession.user_id == user.id,
                WorkoutSession.session_date >= since,
                WorkoutSession.deleted_at.is_(None),
            )
            .group_by(WorkoutSession.session_date)
        ).all()

        counts_by_monday: dict[date, int] = {m: 0 for m in mondays}
        for r in rows:
            monday_of_session = r.session_date - timedelta(days=r.session_date.weekday())
            if monday_of_session in counts_by_monday:
                counts_by_monday[monday_of_session] += r.cnt

        return WorkoutsChartResponse(
            data=[
                WorkoutWeekPoint(week=m.strftime("%b %d"), count=counts_by_monday[m])
                for m in mondays
            ]
        )

    def calories_chart(self, db: Session, user: User, days: int = 7) -> CaloriesChartResponse:
        today = date.today()
        since = today - timedelta(days=days - 1)

        rows = db.execute(
            select(
                NutritionEntry.entry_date,
                func.coalesce(func.sum(NutritionEntry.calories), 0.0).label("total"),
            )
            .where(
                NutritionEntry.user_id == user.id,
                NutritionEntry.entry_date >= since,
                NutritionEntry.entry_date <= today,
                NutritionEntry.deleted_at.is_(None),
            )
            .group_by(NutritionEntry.entry_date)
        ).all()

        calories_by_date = {r.entry_date: r.total for r in rows}
        return CaloriesChartResponse(
            data=[
                CaloriesDataPoint(date=since + timedelta(days=i), calories=calories_by_date.get(since + timedelta(days=i), 0.0))
                for i in range(days)
            ]
        )


dashboard_service = DashboardService()
