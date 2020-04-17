"""added team.accepted

Revision ID: dfbd11802e7a
Revises: 
Create Date: 2020-04-15 20:18:12.666898

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'dfbd11802e7a'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('leagues', sa.Column('tournament_id', sa.Integer(), nullable=True))
    op.create_foreign_key(None, 'leagues', 'tournaments', ['tournament_id'], ['id'])
    op.add_column('teams', sa.Column('accepted', sa.Boolean(), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('teams', 'accepted')
    op.drop_constraint(None, 'leagues', type_='foreignkey')
    op.drop_column('leagues', 'tournament_id')
    # ### end Alembic commands ###
