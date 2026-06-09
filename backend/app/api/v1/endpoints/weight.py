import uuid

from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user, get_db
from app.models.user import User
from app.schemas.weight import WeightHistoryResponse, WeightLogRequest, WeightLogResponse
from app.services.weight_service import weight_service

router = APIRouter()

# Literal route first — /history must be before /{entry_id}


@router.get("/history", response_model=WeightHistoryResponse)
def get_history(
    days: int = Query(default=30, ge=1, le=365, description="Rolling window in days"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return weight_service.history(db, current_user, days=days)


@router.post("", response_model=WeightLogResponse)
def log_weight(
    body: WeightLogRequest,
    response: Response,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    result, is_new = weight_service.upsert(db, current_user, body)
    response.status_code = 201 if is_new else 200
    return result


@router.delete("/{entry_id}", status_code=204)
def delete_weight(
    entry_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    weight_service.delete(db, current_user, entry_id)
