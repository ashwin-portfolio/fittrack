"""Enhance goals — target_date and weekly_workout_target columns

Revision ID: f6b8d2a4c1e7
Revises: e5a7c9b3f2d8
Create Date: 2026-06-30
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "f6b8d2a4c1e7"
down_revision: Union[str, None] = "e5a7c9b3f2d8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("goals", sa.Column("target_date", sa.Date(), nullable=True))
    op.add_column(
        "goals",
        sa.Column("weekly_workout_target", sa.SmallInteger(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("goals", "weekly_workout_target")
    op.drop_column("goals", "target_date")
