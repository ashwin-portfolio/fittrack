from __future__ import annotations

import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models.template import TemplateExercise, TemplateSet, WorkoutTemplate


class TemplateRepository:
    def _with_detail(self, stmt):
        return stmt.options(
            selectinload(WorkoutTemplate.template_exercises).selectinload(TemplateExercise.exercise),
            selectinload(WorkoutTemplate.template_exercises).selectinload(TemplateExercise.sets),
        )

    def create(self, db: Session, *, user_id: uuid.UUID, name: str, notes: str | None) -> WorkoutTemplate:
        template = WorkoutTemplate(user_id=user_id, name=name, notes=notes)
        db.add(template)
        db.flush()
        return template

    def add_exercise(
        self, db: Session, *, template_id: uuid.UUID, exercise_id: uuid.UUID, order_index: int
    ) -> TemplateExercise:
        te = TemplateExercise(template_id=template_id, exercise_id=exercise_id, order_index=order_index)
        db.add(te)
        db.flush()
        return te

    def add_set(
        self,
        db: Session,
        *,
        template_exercise_id: uuid.UUID,
        set_number: int,
        reps: int,
        weight_kg: float,
    ) -> TemplateSet:
        ts = TemplateSet(
            template_exercise_id=template_exercise_id,
            set_number=set_number,
            reps=reps,
            weight_kg=weight_kg,
        )
        db.add(ts)
        return ts

    def list_for_user(
        self, db: Session, user_id: uuid.UUID, *, limit: int = 50, offset: int = 0
    ) -> tuple[list[WorkoutTemplate], int]:
        total = db.scalar(
            select(func.count(WorkoutTemplate.id)).where(WorkoutTemplate.user_id == user_id)
        ) or 0
        stmt = (
            self._with_detail(select(WorkoutTemplate))
            .where(WorkoutTemplate.user_id == user_id)
            .order_by(WorkoutTemplate.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        return list(db.scalars(stmt)), total

    def get_by_id(self, db: Session, template_id: uuid.UUID) -> WorkoutTemplate | None:
        stmt = self._with_detail(select(WorkoutTemplate)).where(WorkoutTemplate.id == template_id)
        return db.scalar(stmt)

    def delete(self, db: Session, template: WorkoutTemplate) -> None:
        db.delete(template)


template_repo = TemplateRepository()
