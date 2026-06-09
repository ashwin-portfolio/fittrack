"""weight_logs: add soft delete, partial unique index

Revision ID: c3e5a7b9d2f1
Revises: b2d4f6a8c1e3
Create Date: 2026-06-08
"""
from alembic import op
import sqlalchemy as sa

revision = "c3e5a7b9d2f1"
down_revision = "b2d4f6a8c1e3"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. Add deleted_at column
    op.add_column(
        "weight_logs",
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )

    # 2. Drop the old full unique index
    op.drop_index("idx_weight_logs_user_date", table_name="weight_logs")

    # 3. Re-create as partial unique index (only non-deleted entries must be unique)
    op.create_index(
        "idx_weight_logs_user_date",
        "weight_logs",
        ["user_id", "log_date"],
        unique=True,
        postgresql_where=sa.text("deleted_at IS NULL"),
    )


def downgrade() -> None:
    op.drop_index("idx_weight_logs_user_date", table_name="weight_logs")
    op.create_index(
        "idx_weight_logs_user_date",
        "weight_logs",
        ["user_id", "log_date"],
        unique=True,
    )
    op.drop_column("weight_logs", "deleted_at")
