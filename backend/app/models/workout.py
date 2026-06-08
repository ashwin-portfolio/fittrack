from __future__ import annotations

import uuid
from datetime import date
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Date, ForeignKey, Index, SmallInteger, String, Text, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.mixins import SoftDeleteMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.exercise import Exercise
    from app.models.user import User


class WorkoutSession(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "workout_sessions"
    __table_args__ = (
        Index("idx_workout_sessions_user_date", "user_id", "session_date"),
        Index("idx_workout_sessions_shared", "is_shared"),
        Index("idx_workout_sessions_deleted", "deleted_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
    )
    session_date: Mapped[date] = mapped_column(Date)
    name: Mapped[str | None] = mapped_column(String(100))
    notes: Mapped[str | None] = mapped_column(Text)
    is_shared: Mapped[bool] = mapped_column(Boolean, default=False)

    # ── Relationships ────────────────────────────────────────────────────────
    user: Mapped[User] = relationship("User", back_populates="workout_sessions")
    workout_exercises: Mapped[list[WorkoutExercise]] = relationship(
        "WorkoutExercise",
        back_populates="session",
        cascade="all, delete-orphan",
        order_by="WorkoutExercise.order_index",
    )


class WorkoutExercise(Base, TimestampMixin):
    __tablename__ = "workout_exercises"
    __table_args__ = (
        # Composite: used to fetch exercises for a session in order
        Index("idx_workout_exercises_session", "session_id", "order_index"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    session_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("workout_sessions.id", ondelete="CASCADE"),
    )
    # RESTRICT: cannot delete an exercise that is referenced by a workout
    exercise_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("exercises.id", ondelete="RESTRICT"),
    )
    order_index: Mapped[int] = mapped_column(SmallInteger, default=0)

    # ── Relationships ────────────────────────────────────────────────────────
    session: Mapped[WorkoutSession] = relationship(
        "WorkoutSession",
        back_populates="workout_exercises",
    )
    exercise: Mapped[Exercise] = relationship(
        "Exercise",
        back_populates="workout_exercises",
    )
    sets: Mapped[list[ExerciseSet]] = relationship(
        "ExerciseSet",
        back_populates="workout_exercise",
        cascade="all, delete-orphan",
        order_by="ExerciseSet.set_number",
    )


class ExerciseSet(Base, TimestampMixin):
    __tablename__ = "exercise_sets"
    __table_args__ = (
        Index("idx_exercise_sets_exercise", "workout_exercise_id", "set_number"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    workout_exercise_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("workout_exercises.id", ondelete="CASCADE"),
    )
    set_number: Mapped[int] = mapped_column(SmallInteger)
    reps: Mapped[int] = mapped_column(SmallInteger)
    # 0.0 = bodyweight exercise
    weight_kg: Mapped[float] = mapped_column(Float, default=0.0)

    # ── Relationships ────────────────────────────────────────────────────────
    workout_exercise: Mapped[WorkoutExercise] = relationship(
        "WorkoutExercise",
        back_populates="sets",
    )
