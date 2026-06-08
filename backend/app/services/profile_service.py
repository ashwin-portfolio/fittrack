from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories.profile_repository import profile_repo
from app.schemas.profile import OnboardingRequest, ProfileResponse, ProfileUpdateRequest


class ProfileService:
    def get_my_profile(self, db: Session, current_user: User) -> ProfileResponse:
        profile = profile_repo.get_by_user_id(db, current_user.id)
        if profile is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
        return ProfileResponse.model_validate(profile)

    def update_profile(
        self, db: Session, current_user: User, body: ProfileUpdateRequest
    ) -> ProfileResponse:
        profile = profile_repo.get_by_user_id(db, current_user.id)
        if profile is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

        # Only apply fields that were explicitly sent in the request body
        fields = body.model_dump(exclude_unset=True)
        if not fields:
            return ProfileResponse.model_validate(profile)

        updated = profile_repo.update(db, profile, fields)
        return ProfileResponse.model_validate(updated)

    def complete_onboarding(
        self, db: Session, current_user: User, body: OnboardingRequest
    ) -> ProfileResponse:
        profile = profile_repo.get_by_user_id(db, current_user.id)
        if profile is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

        fields = body.model_dump(exclude_none=True)
        fields["onboarding_complete"] = True

        updated = profile_repo.update(db, profile, fields)
        return ProfileResponse.model_validate(updated)


profile_service = ProfileService()
