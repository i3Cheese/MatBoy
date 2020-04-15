import datetime
import sqlalchemy as sa
from sqlalchemy import orm
from data.db_session import BaseModel


class League(BaseModel):
    __tablename__ = "leagues"
    __repr_attrs__ = ["title", "chief"]

    id = sa.Column(sa.Integer, primary_key=True, autoincrement=True)
    title = sa.Column(sa.String, unique=True)
    description = sa.Column(sa.Text, nullable=True)
    chief_id = sa.Column(sa.Integer, sa.ForeignKey("users.id"))
    tournament_id = sa.Column(sa.Integer, sa.ForeignKey("tournaments.id"))

    chief = orm.relationship("User", backref="leagues")
    tournament = orm.relationship("Tournament", backref="leagues")
    