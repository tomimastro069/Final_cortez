"""init

Revision ID: b837c6e261e1
Revises: 
Create Date: 2025-12-09 20:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'b837c6e261e1'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema: create all tables with id_key PK and correct FKs."""

    # ----- Clients -----
    op.create_table(
        'clients',
        sa.Column('id_key', sa.Integer, primary_key=True, autoincrement=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('lastname', sa.String(), nullable=True),
        sa.Column('email', sa.String(), nullable=False, unique=True),
        sa.Column('telephone', sa.String(), nullable=True),
        sa.Column('password', sa.String(), nullable=True),
    )

    # ----- Categories -----
    op.create_table(
        'categories',
        sa.Column('id_key', sa.Integer, primary_key=True, autoincrement=True),
        sa.Column('name', sa.String(), nullable=False, unique=True),
    )

    # ----- Products -----
    op.create_table(
        'products',
        sa.Column('id_key', sa.Integer, primary_key=True, autoincrement=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('price', sa.Float(), nullable=False),
        sa.Column('stock', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('category_id', sa.Integer(), sa.ForeignKey('categories.id_key')),
        sa.CheckConstraint('stock >= 0', name='check_product_stock_non_negative'),
    )

    # ----- Bills -----
    op.create_table(
        'bills',
        sa.Column('id_key', sa.Integer, primary_key=True, autoincrement=True),
        sa.Column('bill_number', sa.String(), nullable=False, unique=True),
        sa.Column('discount', sa.Float(), nullable=True),
        sa.Column('date', sa.Date(), nullable=True),
        sa.Column('total', sa.Float(), nullable=True),
        sa.Column('payment_type', sa.Enum('CASH', 'CARD', 'DEBIT', 'CREDIT', 'BANK_TRANSFER', name='paymenttype'), nullable=True),
        sa.Column('client_id', sa.Integer(), sa.ForeignKey('clients.id_key')),
    )

    # ----- Orders -----
    op.create_table(
        'orders',
        sa.Column('id_key', sa.Integer, primary_key=True, autoincrement=True),
        sa.Column('date', sa.DateTime(), nullable=True),
        sa.Column('total', sa.Float(), nullable=True),
        sa.Column('delivery_method', sa.Enum('DRIVE_THRU','ON_HAND','HOME_DELIVERY', name='deliverymethod'), nullable=True),
        sa.Column('status', sa.Enum('PENDING','IN_PROGRESS','DELIVERED','CANCELED', name='status'), nullable=True),
        sa.Column('client_id', sa.Integer(), sa.ForeignKey('clients.id_key')),
        sa.Column('bill_id', sa.Integer(), sa.ForeignKey('bills.id_key')),
    )

    # ----- Order Details -----
    op.create_table(
        'order_details',
        sa.Column('id_key', sa.Integer, primary_key=True, autoincrement=True),
        sa.Column('quantity', sa.Integer(), nullable=True),
        sa.Column('price', sa.Float(), nullable=True),
        sa.Column('order_id', sa.Integer(), sa.ForeignKey('orders.id_key')),
        sa.Column('product_id', sa.Integer(), sa.ForeignKey('products.id_key')),
    )

    # ----- Addresses -----
    op.create_table(
        'addresses',
        sa.Column('id_key', sa.Integer, primary_key=True, autoincrement=True),
        sa.Column('street', sa.String(), nullable=False),
        sa.Column('number', sa.String(), nullable=True),
        sa.Column('city', sa.String(), nullable=True),
        sa.Column('client_id', sa.Integer(), sa.ForeignKey('clients.id_key')),
    )

    # ----- Reviews -----
    op.create_table(
        'reviews',
        sa.Column('id_key', sa.Integer, primary_key=True, autoincrement=True),
        sa.Column('rating', sa.Float(), nullable=False),
        sa.Column('comment', sa.String(), nullable=True),
        sa.Column('product_id', sa.Integer(), sa.ForeignKey('products.id_key')),
        sa.CheckConstraint('rating >= 1.0 AND rating <= 5.0', name='check_rating_range'),
    )


def downgrade() -> None:
    """Drop all tables in reverse order."""
    op.drop_table('reviews')
    op.drop_table('addresses')
    op.drop_table('order_details')
    op.drop_table('orders')
    op.drop_table('bills')
    op.drop_table('products')
    op.drop_table('categories')
    op.drop_table('clients')
