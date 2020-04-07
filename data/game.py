import datetime
import sqlalchemy as sa
from sqlalchemy import orm
from data.db_session import BaseModel


class Game(BaseModel):
    __tablename__ = "games"
    __repr_attrs__ = ["team1", "team2", "league", "start"]

    id = sa.Column(sa.Integer, primary_key=True, autoincrement=True)
    place = sa.Column(sa.String, nullable=True)
    start = sa.Column(sa.DateTime, nullable=True)
    team1_id = sa.Column(sa.Integer, sa.ForeignKey("teams.id"))
    team2_id = sa.Column(sa.Integer, sa.ForeignKey("teams.id"))
    league_id = sa.Column(sa.Integer, sa.ForeignKey("leagues.id"))
    protocol = sa.Column(sa.Text, nullable=True)
    finish = sa.Column(sa.Boolean, default=False)

    team1 = orm.relationship("Team", backref="games_1", foreign_keys=[team1_id,])
    team2 = orm.relationship("Team", backref="games_2", foreign_keys=[team2_id,])
    league = orm.relationship("League", backref="games")