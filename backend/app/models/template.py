from __future__ import annotations

import uuid

from sqlalchemy import Float, ForeignKey, SmallInteger, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.mixins import TimestampMixin


class WorkoutTemplate(TimestampMixin, Base):
    __tablename__ = "workout_templates"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    template_exercises: Mapped[list[TemplateExercise]] = relationship(
        "TemplateExercise",
        back_populates="template",
        cascade="all, delete-orphan",
        order_by="TemplateExercise.order_index",
    )


class TemplateExercise(TimestampMixin, Base):
    __tablename__ = "template_exercises"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    template_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("workout_templates.id", ondelete="CASCADE"), nullable=False
    )
    exercise_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("exercises.id", ondelete="RESTRICT"), nullable=False
    )
    order_index: Mapped[int] = mapped_column(SmallInteger, nullable=False, default=0)

    template: Mapped[WorkoutTemplate] = relationship("WorkoutTemplate", back_populates="template_exercises")
    exercise = relationship("Exercise")
    sets: Mapped[list[TemplateSet]] = relationship(
        "TemplateSet",
        back_populates="template_exercise",
        cascade="all, delete-orphan",
        order_by="TemplateSet.set_number",
    )


class TemplateSet(TimestampMixin, Base):
    __tablename__ = "template_sets"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    template_exercise_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("template_exercises.id", ondelete="CASCADE"), nullable=False
    )
    set_number: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    reps: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    weight_kg: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)

    template_exercise: Mapped[TemplateExercise] = relationship("TemplateExercise", back_populates="sets")
