"""Add water tracking (water_logs, water_goals)

Revision ID: c4e6a8b1f3d7
Revises: b3d5f7a9e2c4
Create Date: 2026-08-05
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "c4e6a8b1f3d7"
down_revision = "b3d5f7a9e2c4"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "water_logs",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("log_date", sa.Date(), nullable=False),
        sa.Column("amount_ml", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("idx_water_logs_user_date", "water_logs", ["user_id", "log_date"])

    op.create_table(
        "water_goals",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("daily_target_ml", sa.Integer(), nullable=False, server_default="2000"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("uq_water_goals_user", "water_goals", ["user_id"], unique=True)


def downgrade() -> None:
    op.drop_index("uq_water_goals_user", table_name="water_goals")
    op.drop_table("water_goals")
    op.drop_index("idx_water_logs_user_date", table_name="water_logs")
    op.drop_table("water_logs")
