import typing as t
import sqlalchemy as sa
from sqlalchemy import orm
from data.base_model import BaseModel

users_to_teams = sa.Table('users_to_teams', BaseModel.metadata,
                          sa.Column('user', sa.Integer,
                                    sa.ForeignKey('users.id')),
                          sa.Column('team', sa.Integer,
                                    sa.ForeignKey('teams.id'))
                          )


class Team(BaseModel):
    """
    Represent Team module from db.
    :status: 0-declined 1-waiting 2-accepted
    """
    __tablename__ = "teams"
    __repr_attrs__ = ["name", "tournament"]
    _serialize_only = ("id",
                       "name",
                       "motto",
                       "status",
                       "trainer",
                       "tournament",
                       "league",
                       "players",
                       "full_access",
                       "manage_access",
                       )
    _sensitive_fields = ('access_group',)

    def have_full_access(self, user) -> bool:
        return self.tournament.have_manage_access(user)

    def have_manage_access(self, user) -> bool:
        return self.trainer == user or self.have_full_access(user)

    id = sa.Column(sa.Integer, primary_key=True, autoincrement=True)
    name = sa.Column(sa.String, nullable=False)
    motto = sa.Column(sa.String, nullable=True)
    status = sa.Column(sa.String, default='waiting')

    trainer_id = sa.Column(
        sa.Integer, sa.ForeignKey("users.id"), nullable=True)
    trainer = orm.relationship("User")

    tournament_id = sa.Column(sa.Integer, sa.ForeignKey(
        "tournaments.id"), nullable=True)
    tournament = orm.relationship("Tournament", back_populates="teams")

    league_id = sa.Column(sa.Integer, sa.ForeignKey(
        "leagues.id"), nullable=True)
    league = orm.relationship("League", back_populates="teams")

    players = orm.relationship("User", secondary="users_to_teams", back_populates="teams")

    games_1 = orm.relationship("Game", back_populates="team_1")
    games_2 = orm.relationship("Game", back_populates="team_2")

    def __init__(self, *args,
                 name: str,
                 motto: t.Optional[str] = None,
                 tournament,
                 trainer,
                 players,
                 **kwargs):
        super().__init__(*args, **kwargs)
        self.name = name
        self.motto = motto
        self.tournament = tournament
        self.trainer = trainer
        self.players = players

    def __str__(self):
        return self.name

    @property
    def link(self) -> str:
        return self.tournament.link + '/team/{0}'.format(self.id)

    def check_relation(self, tour_id) -> bool:
        return self.tournament_id == tour_id

    @property
    def games(self):
        return list(set(self.games_1 + self.games_2))
