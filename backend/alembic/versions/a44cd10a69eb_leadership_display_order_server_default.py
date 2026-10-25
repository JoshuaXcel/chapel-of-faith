"""leadership display_order server default

Revision ID: a44cd10a69eb
Revises: c8765c90af7d
Create Date: 2026-10-25 16:15:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a44cd10a69eb'
down_revision: Union[str, Sequence[str], None] = 'c8765c90af7d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column(
        "leadership",
        "display_order",
        existing_type=sa.Integer(),
        existing_nullable=False,
        server_default=sa.text("0"),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column(
        "leadership",
        "display_order",
        existing_type=sa.Integer(),
        existing_nullable=False,
        server_default=None,
    )
