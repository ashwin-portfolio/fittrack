from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories.goal_repository import goal_repo
from app.repositories.workout_repository import workout_repo
from app.schemas.goal import GoalCreateRequest, GoalResponse, WorkoutProgressResponse


class GoalService:
    def get_active(self, db: Session, current_user: User) -> GoalResponse:
        goal = goal_repo.get_active(db, current_user.id)
        if goal is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No active goal. Set one with POST /goals.",
            )
        return GoalResponse.model_validate(goal)

    def create(
        self, db: Session, current_user: User, body: GoalCreateRequest
    ) -> GoalResponse:
        goal_repo.deactivate_all(db, current_user.id)
        goal = goal_repo.create(
            db,
            user_id=current_user.id,
            goal_type=body.goal_type,
            target_weight_kg=body.target_weight_kg,
            target_date=body.target_date,
            weekly_workout_target=body.weekly_workout_target,
        )
        return GoalResponse.model_validate(goal)

    def workout_progress(
        self, db: Session, current_user: User
    ) -> WorkoutProgressResponse:
        count = workout_repo.count_this_week(db, current_user.id)
        goal = goal_repo.get_active(db, current_user.id)
        weekly_target = (
            goal.weekly_workout_target
            if goal and goal.goal_type == "workout_frequency"
            else None
        )
        return WorkoutProgressResponse(
            workouts_this_week=count,
            weekly_target=weekly_target,
        )


goal_service = GoalService()
