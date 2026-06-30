import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user, get_db
from app.models.user import User
from app.schemas.template import TemplateCreateRequest, TemplateListResponse, TemplateResponse
from app.services.template_service import template_service

router = APIRouter()


@router.get("", response_model=TemplateListResponse)
def list_templates(
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return template_service.list_templates(db, current_user, limit=limit, offset=offset)


@router.post("", response_model=TemplateResponse, status_code=201)
def create_template(
    body: TemplateCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return template_service.create_template(db, current_user, body)


@router.get("/{template_id}", response_model=TemplateResponse)
def get_template(
    template_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return template_service.get_template(db, current_user, template_id)


@router.delete("/{template_id}", status_code=204)
def delete_template(
    template_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    template_service.delete_template(db, current_user, template_id)
