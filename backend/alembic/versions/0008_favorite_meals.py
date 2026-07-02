"""Add favorite meals

Revision ID: b3d5f7a9e2c4
Revises: a7c9d1e3f5b2
Create Date: 2026-07-02
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "b3d5f7a9e2c4"
down_revision = "a7c9d1e3f5b2"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "favorite_meals",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("food_name", sa.String(200), nullable=False),
        sa.Column("calories", sa.Float(), nullable=False),
        sa.Column("protein_g", sa.Float(), nullable=True),
        sa.Column("carbs_g", sa.Float(), nullable=True),
        sa.Column("fat_g", sa.Float(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "food_name", name="uq_favorite_meals_user_food"),
    )
    op.create_index("ix_favorite_meals_user_id", "favorite_meals", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_favorite_meals_user_id", table_name="favorite_meals")
    op.drop_table("favorite_meals")
