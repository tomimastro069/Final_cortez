"""Add password to client

Revision ID: 004
Revises: 003
Create Date: 2025-12-05 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '004'
down_revision = '003'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('clients', sa.Column('password', sa.String(), nullable=False, server_default='default_password'))


def downgrade():
    op.drop_column('clients', 'password')
