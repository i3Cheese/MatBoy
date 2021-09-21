import typing as t
import datetime

import sqlalchemy as sa
from sqlalchemy import orm

from data.access_group import DefaultAccess
from data.base_model import BaseModel


class Post(BaseModel, DefaultAccess):
    __tablename__ = 'posts'
    __repr_attrs__ = ["title", "tournament"]
    _serialize_only = (
        "id",
        "title",
        "content",
        "status",
        "tournament",
        "author",
        "manage_access",
        "full_access",
        "created_at",
        "updated_at",
        "published_at",
    )

    def have_full_access(self, user) -> bool:
        return self.tournament.have_manage_access(user)

    id = sa.Column(sa.Integer, primary_key=True, autoincrement=True)
    title = sa.Column(sa.String, nullable=False)
    content = sa.Column(sa.Text, nullable=False)
    status: t.Literal["archived", "published"] = sa.Column(sa.String, nullable=False)
    published_at = sa.Column(sa.DateTime, nullable=True)

    author_id = sa.Column(sa.Integer, sa.ForeignKey('users.id'))
    tournament_id = sa.Column(sa.Integer, sa.ForeignKey('tournaments.id'))

    author = orm.relationship('User')
    tournament = orm.relationship('Tournament', back_populates="posts")

    def __init__(self, *args,
                 tournament,
                 title: str,
                 content: str,
                 author,
                 **kwargs):
        super().__init__(*args, **kwargs)
        self.tournament = tournament
        self.title = title
        self.content = content
        self.status = "archived"
        self.author = author

    def check_relation(self, tour_id) -> bool:
        return self.tournament_id == tour_id

    def archive(self):
        self.status = "archived"

    def publish(self):
        self.published_at = datetime.datetime.utcnow()
        self.status = "published"

    def __str__(self):
        return self.title
