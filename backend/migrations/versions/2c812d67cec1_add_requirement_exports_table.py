"""add_requirement_exports_table

Revision ID: 2c812d67cec1
Revises: 001
Create Date: 2025-10-06 14:52:42.673058

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = '2c812d67cec1'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create requirement_exports table
    op.create_table('requirement_exports',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('export_id', sa.String(length=100), nullable=False),
        sa.Column('component_type', sa.String(length=50), nullable=False),
        sa.Column('component_confidence', sa.Float(), nullable=False),
        sa.Column('requirements', sa.JSON(), nullable=False),
        sa.Column('source_type', sa.String(length=50), nullable=False),
        sa.Column('source_metadata', sa.JSON(), nullable=True),
        sa.Column('tokens', sa.JSON(), nullable=True),
        sa.Column('total_requirements', sa.Integer(), nullable=False),
        sa.Column('approved_count', sa.Integer(), nullable=False),
        sa.Column('edited_count', sa.Integer(), nullable=False),
        sa.Column('custom_added_count', sa.Integer(), nullable=False),
        sa.Column('proposal_latency_ms', sa.Integer(), nullable=True),
        sa.Column('approval_duration_ms', sa.Integer(), nullable=True),
        sa.Column('proposed_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('approved_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('exported_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('used_in_pattern_retrieval', sa.Boolean(), nullable=False),
        sa.Column('used_in_code_generation', sa.Boolean(), nullable=False),
        sa.Column('pattern_retrieval_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('code_generation_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('precision_score', sa.Float(), nullable=True),
        sa.Column('recall_score', sa.Float(), nullable=True),
        sa.Column('user_edit_rate', sa.Float(), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_requirement_exports_id'), 'requirement_exports', ['id'])
    op.create_index(op.f('ix_requirement_exports_export_id'), 'requirement_exports', ['export_id'], unique=True)
    op.create_index(op.f('ix_requirement_exports_component_type'), 'requirement_exports', ['component_type'])
    op.create_index(op.f('ix_requirement_exports_source_type'), 'requirement_exports', ['source_type'])
    op.create_index(op.f('ix_requirement_exports_status'), 'requirement_exports', ['status'])
    op.create_index('idx_export_component_type', 'requirement_exports', ['component_type'])
    op.create_index('idx_export_source_type', 'requirement_exports', ['source_type'])
    op.create_index('idx_export_status_created', 'requirement_exports', ['status', 'created_at'])
    op.create_index('idx_export_proposed_at', 'requirement_exports', ['proposed_at'])
    op.create_index('idx_export_exported_at', 'requirement_exports', ['exported_at'])


def downgrade() -> None:
    op.drop_index('idx_export_exported_at', table_name='requirement_exports')
    op.drop_index('idx_export_proposed_at', table_name='requirement_exports')
    op.drop_index('idx_export_status_created', table_name='requirement_exports')
    op.drop_index('idx_export_source_type', table_name='requirement_exports')
    op.drop_index('idx_export_component_type', table_name='requirement_exports')
    op.drop_index(op.f('ix_requirement_exports_status'), table_name='requirement_exports')
    op.drop_index(op.f('ix_requirement_exports_source_type'), table_name='requirement_exports')
    op.drop_index(op.f('ix_requirement_exports_component_type'), table_name='requirement_exports')
    op.drop_index(op.f('ix_requirement_exports_export_id'), table_name='requirement_exports')
    op.drop_index(op.f('ix_requirement_exports_id'), table_name='requirement_exports')
    op.drop_table('requirement_exports')