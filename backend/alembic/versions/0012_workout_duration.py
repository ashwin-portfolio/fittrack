"""Add duration_minutes to workout_sessions (for calories-burned estimates)

Revision ID: e6a8b2d4c7f9
Revises: d5f7a9c1b3e6
Create Date: 2026-09-16
"""
from alembic import op
import sqlalchemy as sa

revision = "e6a8b2d4c7f9"
down_revision = "d5f7a9c1b3e6"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Nullable: every workout logged before this column existed has no duration,
    # and there is no honest value to backfill. Calories are simply not
    # estimated for those sessions.
    op.add_column(
        "workout_sessions",
        sa.Column("duration_minutes", sa.SmallInteger(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("workout_sessions", "duration_minutes")
