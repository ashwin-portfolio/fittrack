from __future__ import annotations

from datetime import date

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories.goal_repository import goal_repo
from app.repositories.profile_repository import profile_repo
from app.repositories.social_repository import social_repo
from app.repositories.weight_repository import weight_repo
from app.schemas.goal import GoalCreateRequest
from app.schemas.profile import (
    OnboardingRequest,
    OnboardingResponse,
    ProfileResponse,
    ProfileUpdateRequest,
)


class ProfileService:
    def _to_response(self, db: Session, current_user: User, profile) -> ProfileResponse:
        return ProfileResponse(
            id=profile.id,
            user_id=profile.user_id,
            username=current_user.username,
            email=current_user.email,
            full_name=profile.full_name,
            age=profile.age,
            gender=profile.gender,
            height_cm=profile.height_cm,
            bio=profile.bio,
            is_public=profile.is_public,
            avatar_color=profile.avatar_color,
            onboarding_complete=profile.onboarding_complete,
            follower_count=social_repo.follower_count(db, current_user.id),
            following_count=social_repo.following_count(db, current_user.id),
            created_at=profile.created_at,
            updated_at=profile.updated_at,
        )

    def get_my_profile(self, db: Session, current_user: User) -> ProfileResponse:
        profile = profile_repo.get_by_user_id(db, current_user.id)
        if profile is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
        return self._to_response(db, current_user, profile)

    def update_profile(
        self, db: Session, current_user: User, body: ProfileUpdateRequest
    ) -> ProfileResponse:
        profile = profile_repo.get_by_user_id(db, current_user.id)
        if profile is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

        fields = body.model_dump(exclude_unset=True)
        if not fields:
            return self._to_response(db, current_user, profile)

        updated = profile_repo.update(db, profile, fields)
        return self._to_response(db, current_user, updated)

    def complete_onboarding(
        self, db: Session, current_user: User, body: OnboardingRequest
    ) -> OnboardingResponse:
        profile = profile_repo.get_by_user_id(db, current_user.id)
        if profile is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

        # Validate goal fields via GoalCreateRequest validator
        try:
            goal_req = GoalCreateRequest(
                goal_type=body.goal_type,
                target_weight_kg=body.target_weight_kg,
            )
        except Exception as exc:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc))

        # 1. Update profile (age, gender, height_cm)
        profile_fields = {
            "age": body.age,
            "gender": body.gender,
            "onboarding_complete": True,
        }
        if body.height_cm is not None:
            profile_fields["height_cm"] = body.height_cm
        profile_repo.update(db, profile, profile_fields)

        # 2. Log initial weight
        weight_repo.upsert(
            db,
            user_id=current_user.id,
            log_date=date.today(),
            weight_kg=body.current_weight_kg,
            is_shared=False,
        )

        # 3. Create goal (deactivates any existing active goal)
        goal_repo.deactivate_all(db, current_user.id)
        goal_repo.create(
            db,
            user_id=current_user.id,
            goal_type=goal_req.goal_type,
            target_weight_kg=goal_req.target_weight_kg,
        )

        return OnboardingResponse(message="Onboarding complete", onboarding_complete=True)


profile_service = ProfileService()
