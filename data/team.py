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
    :status:
        rejected - Rejected by management
        frozen - Can be edit by sender. Waiting for submit. #TODO: do it in v0.3
        submitted - Sent to tour management
        accepted - Accept for tournament. Waiting for league.
        ready - Ready for battle. League should be set
    """
    __tablename__ = "teams"
    __repr_attrs__ = ["name", "tournament"]
    serialize_only = ("id",
                      "name",
                      "motto",
                      "status",
                      "trainer.id",
                      "trainer.email",
                      "trainer.fullname",
                      "players.id",
                      "players.email",
                      "players.fullname",
                      "tournament.id",
                      "tournament.title",
                      "league.id",
                      "league.title",
                      "link",
                      )

    secure_serialize_only = ("id",
                             "name",
                             "motto",
                             "status",
                             "trainer.id",
                             "trainer.fullname",
                             "tournament.id",
                             "tournament.title",
                             "league.id",
                             "league.title",
                             "link",
                             )

    short_serialize_only = ("id",
                            'name',
                            'motto',
                            "status"
                            )

    name = sa.Column(sa.String)
    motto = sa.Column(sa.String, nullable=True)
    status = sa.Column(sa.String, default='submitted')
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
        return sorted(set(self.games_1 + self.games_2), key=lambda game: game.created_at)
