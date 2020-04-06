import datetime
import sqlalchemy as sa
from sqlalchemy import orm
from data.db_session import BaseModel


class Tournament(BaseModel):
    __tablename__ = "tournaments"
    __repr_attrs__ = ["title", "chief"]

    id = sa.Column(sa.Integer, primary_key=True, autoincrement=True)
    title = sa.Column(sa.String, unique=True)
    description = sa.Column(sa.Text, nullable=True)
    place = sa.Column(sa.String, nullable=True)
    start = sa.Column(sa.DateTime, nullable=True)
    end = sa.Column(sa.DateTime, nullable=True)
    chief_id = sa.Column(sa.Integer, sa.ForeignKey("users.id"))

    chief = orm.relationship("User", backref="tournaments")
    