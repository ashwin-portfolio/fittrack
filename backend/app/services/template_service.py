from __future__ import annotations

import uuid

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.template import WorkoutTemplate
from app.models.user import User
from app.repositories.exercise_repository import exercise_repo
from app.repositories.template_repository import template_repo
from app.repositories.workout_repository import workout_repo
from app.schemas.template import (
    SaveAsTemplateRequest,
    TemplateCreateRequest,
    TemplateExerciseResponse,
    TemplateListResponse,
    TemplateResponse,
    TemplateSetResponse,
)


def _build_response(template: WorkoutTemplate) -> TemplateResponse:
    exercises = [
        TemplateExerciseResponse(
            id=te.id,
            exercise_id=te.exercise_id,
            exercise_name=te.exercise.name,
            muscle_group=te.exercise.muscle_group,
            order_index=te.order_index,
            sets=[
                TemplateSetResponse(
                    id=s.id,
                    set_number=s.set_number,
                    reps=s.reps,
                    weight_kg=s.weight_kg,
                )
                for s in te.sets
            ],
        )
        for te in template.template_exercises
    ]
    return TemplateResponse(
        id=template.id,
        name=template.name,
        notes=template.notes,
        exercises=exercises,
        exercise_count=len(exercises),
        created_at=template.created_at,
        updated_at=template.updated_at,
    )


def _check_ownership(template: WorkoutTemplate | None, user_id: uuid.UUID) -> WorkoutTemplate:
    if template is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")
    if template.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return template


class TemplateService:
    def create_template(
        self, db: Session, current_user: User, body: TemplateCreateRequest
    ) -> TemplateResponse:
        for item in body.exercises:
            ex = exercise_repo.get_by_id(db, item.exercise_id)
            if ex is None or (not ex.is_system and ex.created_by_user_id != current_user.id):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Exercise {item.exercise_id} not found or not accessible",
                )

        template = template_repo.create(db, user_id=current_user.id, name=body.name, notes=body.notes)

        for idx, item in enumerate(body.exercises):
            te = template_repo.add_exercise(
                db, template_id=template.id, exercise_id=item.exercise_id, order_index=idx
            )
            for s in item.sets:
                template_repo.add_set(
                    db,
                    template_exercise_id=te.id,
                    set_number=s.set_number,
                    reps=s.reps,
                    weight_kg=s.weight_kg,
                )

        db.flush()
        db.refresh(template, ["template_exercises"])
        for te in template.template_exercises:
            db.refresh(te, ["exercise", "sets"])

        return _build_response(template)

    def list_templates(
        self, db: Session, current_user: User, *, limit: int = 50, offset: int = 0
    ) -> TemplateListResponse:
        templates, total = template_repo.list_for_user(db, current_user.id, limit=limit, offset=offset)
        return TemplateListResponse(
            templates=[_build_response(t) for t in templates],
            total=total,
        )

    def get_template(
        self, db: Session, current_user: User, template_id: uuid.UUID
    ) -> TemplateResponse:
        template = template_repo.get_by_id(db, template_id)
        _check_ownership(template, current_user.id)
        return _build_response(template)  # type: ignore[arg-type]

    def delete_template(
        self, db: Session, current_user: User, template_id: uuid.UUID
    ) -> None:
        template = template_repo.get_by_id(db, template_id)
        _check_ownership(template, current_user.id)
        template_repo.delete(db, template)  # type: ignore[arg-type]

    def save_workout_as_template(
        self, db: Session, current_user: User, workout_id: uuid.UUID, body: SaveAsTemplateRequest
    ) -> TemplateResponse:
        session = workout_repo.get_by_id(db, workout_id)
        if session is None or session.user_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workout not found")

        template = template_repo.create(db, user_id=current_user.id, name=body.name, notes=body.notes)

        for we in session.workout_exercises:
            te = template_repo.add_exercise(
                db,
                template_id=template.id,
                exercise_id=we.exercise_id,
                order_index=we.order_index,
            )
            for s in we.sets:
                template_repo.add_set(
                    db,
                    template_exercise_id=te.id,
                    set_number=s.set_number,
                    reps=s.reps,
                    weight_kg=s.weight_kg,
                )

        db.flush()
        db.refresh(template, ["template_exercises"])
        for te in template.template_exercises:
            db.refresh(te, ["exercise", "sets"])

        return _build_response(template)


template_service = TemplateService()
