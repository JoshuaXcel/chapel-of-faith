"""create members table

Revision ID: e0ef0a74364a
Revises: a44cd10a69eb
Create Date: 2026-10-26 00:20:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e0ef0a74364a'
down_revision: Union[str, Sequence[str], None] = 'a44cd10a69eb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "members",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("full_name", sa.String(length=120), nullable=False),
        sa.Column("phone", sa.String(length=30), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=True),
        sa.Column("gender", sa.String(length=20), nullable=True),
        sa.Column("member_type", sa.String(length=20), nullable=False),
        sa.Column("department", sa.String(length=120), nullable=True),
        sa.Column("level", sa.String(length=20), nullable=True),
        sa.Column("hostel_or_address", sa.String(length=255), nullable=True),
        sa.Column("birth_day", sa.Integer(), nullable=False),
        sa.Column("birth_month", sa.Integer(), nullable=False),
        sa.Column("birth_year", sa.Integer(), nullable=True),
        sa.Column("joined_whatsapp_consent", sa.Boolean(), server_default="false", nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table("members")
