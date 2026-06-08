from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, Index, String, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.mixins import TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.workout import WorkoutExercise


class Exercise(Base, TimestampMixin):
    __tablename__ = "exercises"
    __table_args__ = (
        Index("idx_exercises_name", "name"),
        Index("idx_exercises_muscle_group", "muscle_group"),
        Index("idx_exercises_system", "is_system"),
        # Partial unique index — no duplicate custom exercise names per user
        Index(
            "idx_exercises_user_name_unique",
            "created_by_user_id",
            "name",
            unique=True,
            postgresql_where=text("created_by_user_id IS NOT NULL"),
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(100))
    # Values: chest / back / shoulders / biceps / triceps / legs /
    #         core / cardio / full_body / other  (validated at app layer)
    muscle_group: Mapped[str] = mapped_column(String(30))
    is_system: Mapped[bool] = mapped_column(Boolean, default=False)
    # NULL for system exercises; SET NULL if the creating user is deleted
    created_by_user_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
    )

    # ── Relationships ────────────────────────────────────────────────────────
    creator: Mapped[User | None] = relationship("User", back_populates="exercises")
    workout_exercises: Mapped[list[WorkoutExercise]] = relationship(
        "WorkoutExercise",
        back_populates="exercise",
    )
