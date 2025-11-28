"""Add sample categories and products

Revision ID: 003_add_sample_data
Revises: 002_add_client_id
Create Date: 2025-11-27 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '003_add_sample_data'
down_revision = '002_add_client_id'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Insert sample categories and products."""
    # Insert sample categories
    op.bulk_insert(
        sa.Table(
            'categories',
            sa.MetaData(),
            sa.Column('id_key', sa.Integer(), primary_key=True),
            sa.Column('name', sa.String()),
        ),
        [
            {'id_key': 1, 'name': 'Electronics'},
            {'id_key': 2, 'name': 'Books'},
            {'id_key': 3, 'name': 'Home Appliances'},
        ]
    )

    # Insert sample products
    op.bulk_insert(
        sa.Table(
            'products',
            sa.MetaData(),
            sa.Column('id_key', sa.Integer(), primary_key=True),
            sa.Column('name', sa.String()),
            sa.Column('description', sa.String()),
            sa.Column('price', sa.Float()),
            sa.Column('stock', sa.Integer()),
            sa.Column('category_id', sa.Integer(), sa.ForeignKey('categories.id_key')),
        ),
        [
            {
                'id_key': 101,
                'name': 'Laptop Pro X',
                'description': 'High-performance laptop for professionals.',
                'price': 1200.00,
                'stock': 50,
                'category_id': 1
            },
            {
                'id_key': 102,
                'name': 'Wireless Headphones',
                'description': 'Noise-cancelling headphones with long battery life.',
                'price': 150.00,
                'stock': 120,
                'category_id': 1
            },
            {
                'id_key': 201,
                'name': 'The Great Novel',
                'description': 'A captivating story that will keep you on the edge of your seat.',
                'price': 25.00,
                'stock': 200,
                'category_id': 2
            },
            {
                'id_key': 301,
                'name': 'Smart Coffee Maker',
                'description': 'Brew coffee from anywhere with this smart appliance.',
                'price': 80.00,
                'stock': 75,
                'category_id': 3
            },
        ]
    )


def downgrade() -> None:
    """Remove sample products and categories."""
    op.execute("DELETE FROM products WHERE id_key IN (101, 102, 201, 301)")
    op.execute("DELETE FROM categories WHERE id_key IN (1, 2, 3)")
