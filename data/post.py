import sqlalchemy as sa
from sqlalchemy import orm
from data.db_session import BaseModel

import datetime


class Post(BaseModel):
    __tablename__ = 'posts'
    __repr_attrs__ = ["title", "tournament"]
    serialize_only = (
        "id",
        "title",
        "content",
        "status",
        "tournament.id",
        "tournament.title",
        "author.id",
        "author.email",
        "author.fullname",
        "created_info"
    )
    secure_serialize_only = (
        "id",
        "title",
        "content",
        "status",
        "tournament.id",
        "tournament.title",
        "author.id",
        "author.fullname",
        "created_info"
    )

    title = sa.Column(sa.String, nullable=False)
    content = sa.Column(sa.Text, nullable=False)
    status = sa.Column(sa.Integer, nullable=False, default=1)
    author_id = sa.Column(sa.Integer, sa.ForeignKey('users.id'))
    tournament_id = sa.Column(sa.Integer, sa.ForeignKey('tournaments.id'))

    author = orm.relationship('User', backref="posts")
    tournament = orm.relationship('Tournament', backref="posts")

    @property
    def created_info(self):
        created_date = datetime.datetime.fromisoformat(str(self.created_at))
        return created_date.strftime('%d %B %Y')

    def __str__(self):
        return self.title

    def have_permission(self, user):
        return user == self.author or self.tournament.have_permission(user)
