"""add email verification and password reset tokens

Revision ID: a7c9d1e3f5b2
Revises: f6b8d2a4c1e7
Create Date: 2026-06-30

"""
from alembic import op
import sqlalchemy as sa

revision = 'a7c9d1e3f5b2'
down_revision = 'f6b8d2a4c1e7'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add is_email_verified to users (default False — existing users must verify)
    op.add_column('users', sa.Column('is_email_verified', sa.Boolean(), nullable=False, server_default='false'))

    # Auth tokens table: handles both password_reset and email_verification
    op.create_table(
        'auth_tokens',
        sa.Column('id', sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', sa.dialects.postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('token_hash', sa.String(64), nullable=False),
        sa.Column('purpose', sa.String(30), nullable=False),  # 'password_reset' | 'email_verification'
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('used_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text('NOW()')),
    )
    op.create_index('idx_auth_tokens_hash', 'auth_tokens', ['token_hash'], unique=True)
    op.create_index('idx_auth_tokens_user', 'auth_tokens', ['user_id'])


def downgrade() -> None:
    op.drop_index('idx_auth_tokens_user', table_name='auth_tokens')
    op.drop_index('idx_auth_tokens_hash', table_name='auth_tokens')
    op.drop_table('auth_tokens')
    op.drop_column('users', 'is_email_verified')
