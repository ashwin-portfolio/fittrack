"""Add updated_at to favorite_meals

Revision ID: d5f7b9c1a3e6
Revises: c4e6a8b1f3d7
Create Date: 2026-08-06
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "d5f7b9c1a3e6"
down_revision: Union[str, None] = "c4e6a8b1f3d7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "favorite_meals",
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )


def downgrade() -> None:
    op.drop_column("favorite_meals", "updated_at")
