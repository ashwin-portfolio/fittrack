from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories.calorie_goal_repository import calorie_goal_repo
from app.schemas.calorie_goal import CalorieGoalRequest, CalorieGoalResponse


class CalorieGoalService:
    def _to_response(self, goal) -> CalorieGoalResponse:
        return CalorieGoalResponse(
            id=goal.id,
            daily_calories=goal.daily_calories,
            created_at=goal.created_at,
            updated_at=goal.updated_at,
        )

    def get_goal(self, db: Session, current_user: User) -> CalorieGoalResponse:
        goal = calorie_goal_repo.get_for_user(db, current_user.id)
        if goal is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No calorie goal set",
            )
        return self._to_response(goal)

    def set_goal(
        self, db: Session, current_user: User, body: CalorieGoalRequest
    ) -> CalorieGoalResponse:
        goal = calorie_goal_repo.upsert(db, current_user.id, body.daily_calories)
        return self._to_response(goal)


calorie_goal_service = CalorieGoalService()
