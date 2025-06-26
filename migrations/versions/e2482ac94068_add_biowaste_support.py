"""Add biowaste support

Revision ID: e2482ac94068
Revises: 6787e8dea2ba
Create Date: 2024-01-15 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'e2482ac94068'
down_revision = '6787e8dea2ba'
branch_labels = None
depends_on = None


def upgrade():
    # Add waste_type column to order table
    op.add_column('order', sa.Column('waste_type', sa.String(length=20), nullable=False, server_default='e-waste'))
    
    # Create biowaste_order table
    op.create_table('biowaste_order',
        sa.Column('order_id', sa.Integer(), nullable=False),
        sa.Column('date', sa.DateTime(), nullable=False),
        sa.Column('user_email', sa.String(length=120), nullable=False),
        sa.Column('address_id', sa.Integer(), nullable=False),
        sa.Column('contact_number', sa.String(length=10), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('images', sa.JSON(), nullable=True),
        sa.Column('bio_waste_category', sa.String(length=50), nullable=False),
        sa.Column('quantity', sa.Float(), nullable=False),
        sa.Column('unit', sa.String(length=20), nullable=False),
        sa.Column('special_instructions', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['address_id'], ['address.address_id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['user_email'], ['user.email'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('order_id'),
        sa.UniqueConstraint('order_id')
    )
    op.create_index(op.f('ix_biowaste_order_user_email'), 'biowaste_order', ['user_email'], unique=False)


def downgrade():
    # Drop biowaste_order table
    op.drop_index(op.f('ix_biowaste_order_user_email'), table_name='biowaste_order')
    op.drop_table('biowaste_order')
    
    # Remove waste_type column from order table
    op.drop_column('order', 'waste_type')
