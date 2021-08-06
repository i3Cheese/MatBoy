import sqlalchemy as sa
from sqlalchemy import orm
from data.base_model import BaseModel

import datetime


class Post(BaseModel):
    __tablename__ = 'posts'
    __repr_attrs__ = ["title", "tournament"]
    serialize_only = (
        "id",
        "title",
        "content",
        "status",
        "now",
        "tournament",
        "author",
        "created_info",
        "edit_access",
    )

    title = sa.Column(sa.String, nullable=False)
    content = sa.Column(sa.Text, nullable=False)
    status = sa.Column(sa.Integer, nullable=False, default=1)
    now = sa.Column(sa.Boolean, nullable=False, default=False)
    author_id = sa.Column(sa.Integer, sa.ForeignKey('users.id'))
    tournament_id = sa.Column(sa.Integer, sa.ForeignKey('tournaments.id'))

    author = orm.relationship('User', backref="posts")
    tournament = orm.relationship('Tournament', backref="posts")

    def check_relation(self, tour_id) -> bool:
        return self.tournament_id == tour_id

    @property
    def created_info(self):
        created_date = datetime.datetime.fromisoformat(str(self.created_at))
        return created_date.strftime('%d %B %Y')

    def __str__(self):
        return self.title

    def have_permission(self, user):
        return user == self.author or self.tournament.have_permission(user)
