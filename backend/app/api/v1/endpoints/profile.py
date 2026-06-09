from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user, get_db
from app.models.user import User
from app.schemas.profile import (
    OnboardingRequest,
    OnboardingResponse,
    ProfileResponse,
    ProfileUpdateRequest,
)
from app.services.profile_service import profile_service

router = APIRouter()


@router.get("/me", response_model=ProfileResponse)
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return profile_service.get_my_profile(db, current_user)


@router.put("/me", response_model=ProfileResponse)
def update_profile(
    body: ProfileUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return profile_service.update_profile(db, current_user, body)


@router.put("/onboarding", response_model=OnboardingResponse)
def complete_onboarding(
    body: OnboardingRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return profile_service.complete_onboarding(db, current_user, body)
