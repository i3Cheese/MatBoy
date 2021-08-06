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
    :status: 0-deleted 1-waiting 2-accepted
    """
    __tablename__ = "teams"
    __repr_attrs__ = ["name", "tournament"]
    serialize_only = ("id",
                      "name",
                      "motto",
                      "status",
                      "status_string",
                      "trainer",
                      "tournament",
                      "league",
                      "players",
                      "edit_access",
                      )

    name = sa.Column(sa.String)
    motto = sa.Column(sa.String, nullable=True)
    status = sa.Column(sa.Integer, default=1)
    trainer_id = sa.Column(
        sa.Integer, sa.ForeignKey("users.id"), nullable=True)
    tournament_id = sa.Column(sa.Integer, sa.ForeignKey(
        "tournaments.id"), nullable=True)
    league_id = sa.Column(sa.Integer, sa.ForeignKey(
        "leagues.id"), nullable=True)

    trainer = orm.relationship("User", backref="teams_for_train")
    tournament = orm.relationship("Tournament", backref="teams")
    league = orm.relationship("League", backref="teams")

    players = orm.relationship(
        "User", secondary="users_to_teams", backref="teams")

    def __str__(self):
        return self.name

    def have_permission(self, user):
        if user.is_admin or self.trainer == user:
            return True
        elif self.league and self.league.have_permission(user):
            return True
        elif self.tournament.have_permission(user):
            return True
        else:
            return False

    @property
    def link(self) -> str:
        return self.tournament.link + '/team/{0}'.format(self.id)

    def check_relation(self, tour_id) -> bool:
        return self.tournament_id == tour_id

    @property
    def games(self):
        return list(set(self.games_1 + self.games_2))

    @property
    def status_string(self):
        s = self.status
        if s == 0:
            return "declined"
        elif s == 1:
            return "waiting"
        elif s == 2:
            return "accepted"
        else:
            return "declined"

    @status_string.setter
    def status_string(self, s):
        if s == "waiting":
            self.status = 1
        elif s == "accepted":
            self.status =  2
        elif True or s == "declined":
            self.status = 0
