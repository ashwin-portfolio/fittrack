"""Add missing DB-level constraints

Revision ID: b2d4f6a8c1e3
Revises: a3f8b91c2d4e
Create Date: 2026-06-08

Adds:
  1. Partial unique index — only one active goal per user at a time.
     Prevents the race condition where two concurrent POST /goals requests
     create two rows with is_active=true for the same user.

  2. Partial unique index — no duplicate custom exercise names per user.
     Enforces US-012: "Cannot duplicate exercise name within my own custom list."
     System exercises (created_by_user_id IS NULL) are excluded from this
     constraint because duplicate system exercise names are already impossible
     (seeds are inserted idempotently by name).
"""
from typing import Sequence, Union

from alembic import op

revision: str = "b2d4f6a8c1e3"
down_revision: Union[str, None] = "a3f8b91c2d4e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # One active goal per user — partial unique index
    op.create_index(
        "idx_goals_one_active_per_user",
        "goals",
        ["user_id"],
        unique=True,
        postgresql_where="is_active = true",
    )

    # No duplicate exercise names within a single user's custom list
    op.create_index(
        "idx_exercises_user_name_unique",
        "exercises",
        ["created_by_user_id", "name"],
        unique=True,
        postgresql_where="created_by_user_id IS NOT NULL",
    )


def downgrade() -> None:
    op.drop_index("idx_exercises_user_name_unique", table_name="exercises")
    op.drop_index("idx_goals_one_active_per_user", table_name="goals")
