import sqlalchemy as sa
from sqlalchemy import orm
from data.db_session import BaseModel


class Post(BaseModel):
    __tablename__ = 'posts'

    title = sa.Column(sa.String, nullable=False)
    content = sa.Column(sa.Text, nullable=False)
    status = sa.Column(sa.Integer, nullable=False, default=1)
    author_id = sa.Column(sa.Integer, sa.ForeignKey('users.id'))
    tournament_id = sa.Column(sa.Integer, sa.ForeignKey('tournaments.id'))

    author = orm.relationship('User', backref="posts")
    tournament = orm.relationship('Tournament', backref="posts")
