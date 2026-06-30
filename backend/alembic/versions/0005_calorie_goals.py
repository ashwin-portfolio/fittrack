"""Add calorie_goals table

Revision ID: e5a7c9b3f2d8
Revises: d4f6b8a2e1c5
Create Date: 2026-06-30
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "e5a7c9b3f2d8"
down_revision: Union[str, None] = "d4f6b8a2e1c5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "calorie_goals",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("daily_calories", sa.Integer(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "uq_calorie_goals_user", "calorie_goals", ["user_id"], unique=True
    )


def downgrade() -> None:
    op.drop_index("uq_calorie_goals_user", table_name="calorie_goals")
    op.drop_table("calorie_goals")
