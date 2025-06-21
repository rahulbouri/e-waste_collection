"""initial schema

Revision ID: 6787e8dea2ba
Revises: 
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '6787e8dea2ba'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Create user table
    op.create_table('user',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('email', sa.String(length=120), nullable=False),
    sa.Column('name', sa.String(length=120), nullable=True),
    sa.Column('last_submitted_form_data', sa.JSON(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('last_login_at', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('id'),
    sa.UniqueConstraint('email')
    )
    op.create_index(op.f('ix_user_email'), 'user', ['email'], unique=False)
    
    # Create address table
    op.create_table('address',
    sa.Column('address_id', sa.Integer(), nullable=False),
    sa.Column('user_email', sa.String(length=120), nullable=False),
    sa.Column('google_maps', sa.String(length=2083), nullable=True),
    sa.Column('address', sa.String(length=500), nullable=False),
    sa.Column('postal_code', sa.String(length=6), nullable=True),
    sa.Column('city', sa.String(length=20), nullable=True),
    sa.Column('state', sa.String(length=20), nullable=True),
    sa.Column('last_address', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['user_email'], ['user.email'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['last_address'], ['address.address_id'], ondelete='SET NULL'),
    sa.PrimaryKeyConstraint('address_id'),
    sa.UniqueConstraint('address_id')
    )
    op.create_index(op.f('ix_address_user_email'), 'address', ['user_email'], unique=False)
    
    # Create order table
    op.create_table('order',
    sa.Column('order_id', sa.Integer(), nullable=False),
    sa.Column('date', sa.DateTime(), nullable=False),
    sa.Column('user_email', sa.String(length=120), nullable=False),
    sa.Column('address_id', sa.Integer(), nullable=False),
    sa.Column('contact_number', sa.String(length=10), nullable=False),
    sa.Column('description', sa.Text(), nullable=True),
    sa.Column('images', sa.JSON(), nullable=True),
    sa.ForeignKeyConstraint(['address_id'], ['address.address_id'], ondelete='SET NULL'),
    sa.ForeignKeyConstraint(['user_email'], ['user.email'], ondelete='SET NULL'),
    sa.PrimaryKeyConstraint('order_id'),
    sa.UniqueConstraint('order_id')
    )
    op.create_index(op.f('ix_order_user_email'), 'order', ['user_email'], unique=False)
