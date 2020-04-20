import datetime
import sqlalchemy as sa
from sqlalchemy import orm
from data.db_session import BaseModel


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
                      "trainer.id",
                      "trainer.email",
                      "trainer.fullname",
                      "tournament.id",
                      "tournament.title",
                      "league.id",
                      "league.title",
                      )

    id = sa.Column(sa.Integer, primary_key=True, autoincrement=True)
    name = sa.Column(sa.String)
    motto = sa.Column(sa.String, nullable=True)
    status = sa.Column(sa.Integer, default=1)
    trainer_id = sa.Column(sa.Integer, sa.ForeignKey("users.id"), nullable=True)
    tournament_id = sa.Column(sa.Integer, sa.ForeignKey("tournaments.id"), nullable=True)
    league_id = sa.Column(sa.Integer, sa.ForeignKey("leagues.id"), nullable=True)

    trainer = orm.relationship("User", backref="teams_for_train")
    tournament = orm.relationship("Tournament", backref="teams")
    league = orm.relationship("League", backref="teams")

    players = orm.relationship("User", secondary="users_to_teams", backref="teams")
    
    def __str__(self):
        return self.name