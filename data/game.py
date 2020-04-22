import sqlalchemy as sa
from sqlalchemy import orm
from data.db_session import BaseModel
from sqlalchemy_json import MutableJson


class Game(BaseModel):
    __tablename__ = "games"
    __repr_attrs__ = ["team1", "team2", "league", "start"]
    serialize_only = ("id",
                      "title",
                      "place",
                      "start",
                      "protocol",
                      "status",
                      "judge.id",
                      "judge.email",
                      "judge.fullname",
                      "team1.id",
                      "team1.name",
                      "team2.id",
                      "team2.name",
                      "league.id",
                      "league.title",
                      )

    place = sa.Column(sa.String, nullable=True)
    start = sa.Column(sa.DateTime, nullable=True)
    protocol = sa.Column(MutableJson)
    status = sa.Column(sa.Boolean, default=1)
    judge_id = sa.Column(sa.Integer, sa.ForeignKey("users.id"))
    team1_id = sa.Column(sa.Integer, sa.ForeignKey("teams.id"))
    team2_id = sa.Column(sa.Integer, sa.ForeignKey("teams.id"))
    league_id = sa.Column(sa.Integer, sa.ForeignKey("leagues.id"))

    judge = orm.relationship("User", backref="judged_games")
    team1 = orm.relationship("Team", backref="games_1", foreign_keys=[team1_id, ])
    team2 = orm.relationship("Team", backref="games_2", foreign_keys=[team2_id, ])
    league = orm.relationship("League", backref="games")
    
    @property
    def title(self):
        return f"{self.team1.name} — {self.team2.name}"

    def have_permission(self, user) -> bool:
        """Check if user has access to this game"""
        return user.is_admin or self.judge == user or self.league.have_permission(user)
    