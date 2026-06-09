import uuid
from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user, get_db
from app.models.user import User
from app.schemas.nutrition import (
    DailySummaryResponse,
    FoodSearchListResponse,
    FoodSearchResult,
    NutritionCreateRequest,
    NutritionListResponse,
    NutritionResponse,
    RecentFoodResponse,
)
from app.services.food_search_service import food_search_service
from app.services.nutrition_service import nutrition_service

router = APIRouter()

# ── Literal routes FIRST — before any parameterised routes ───────────────────
# FastAPI matches top-to-bottom. /daily-summary, /search, /recent must all be
# registered before /{entry_id} so they are never mistaken for a UUID param.


@router.get("/daily-summary", response_model=DailySummaryResponse)
def get_daily_summary(
    date: date = Query(default=None, description="YYYY-MM-DD, defaults to today"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    target = date or __import__("datetime").date.today()
    return nutrition_service.daily_summary(db, current_user, target)


@router.get("/search", response_model=FoodSearchListResponse)
def search_foods(
    q: str = Query(min_length=2, max_length=100, description="Food name to search"),
    limit: int = Query(default=20, ge=1, le=50),
    current_user: User = Depends(get_current_active_user),
):
    """Search Open Food Facts database — returns pre-filled macro data."""
    return food_search_service.search(q, limit=limit)


@router.get("/recent", response_model=list[RecentFoodResponse])
def get_recent_foods(
    limit: int = Query(default=20, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """User's recently logged foods — ordered by most recently eaten."""
    return nutrition_service.recent_foods(db, current_user, limit=limit)


@router.get("/barcode/{barcode}", response_model=FoodSearchResult)
def barcode_lookup(
    barcode: str,
    current_user: User = Depends(get_current_active_user),
):
    """Look up a product by barcode (EAN-13, UPC-A, etc.)."""
    return food_search_service.barcode_lookup(barcode)


# ── Collection routes ─────────────────────────────────────────────────────────

@router.get("", response_model=NutritionListResponse)
def list_entries(
    date: date | None = Query(default=None, description="Filter by date (YYYY-MM-DD)"),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return nutrition_service.list_entries(
        db, current_user, entry_date=date, skip=skip, limit=limit
    )


@router.post("", response_model=NutritionResponse, status_code=201)
def create_entry(
    body: NutritionCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return nutrition_service.create_entry(db, current_user, body)


@router.delete("/{entry_id}", status_code=204)
def delete_entry(
    entry_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    nutrition_service.delete_entry(db, current_user, entry_id)
