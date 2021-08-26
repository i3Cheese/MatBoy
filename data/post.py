import sqlalchemy as sa
from sqlalchemy import orm
from data.base_model import BaseModel

import datetime


class Post(BaseModel):
    __tablename__ = 'posts'
    __repr_attrs__ = ["title", "tournament"]
    _serialize_only = (
        "id",
        "title",
        "content",
        "status",
        "now",
        "tournament",
        "author",
        "created_info",
        "manage_access",
        "full_access",
    )

    def have_full_access(self, user) -> bool:
        return self.tournament.have_manage_access(user)

    id = sa.Column(sa.Integer, primary_key=True, autoincrement=True)
    title = sa.Column(sa.String, nullable=False)
    content = sa.Column(sa.Text, nullable=False)
    status = sa.Column(sa.Integer, nullable=False, default=1)
    now = sa.Column(sa.Boolean, nullable=False, default=False)
    author_id = sa.Column(sa.Integer, sa.ForeignKey('users.id'))
    tournament_id = sa.Column(sa.Integer, sa.ForeignKey('tournaments.id'))

    author = orm.relationship('User')
    tournament = orm.relationship('Tournament', back_populates="posts")

    def __init__(self, *args,
                 title: str,
                 content: str,
                 status: int = None,
                 author,
                 **kwargs):
        super().__init__(*args, **kwargs)
        self.title = title
        self.content = content,
        self.status = status
        self.author = author

    def check_relation(self, tour_id) -> bool:
        return self.tournament_id == tour_id

    def __str__(self):
        return self.title
