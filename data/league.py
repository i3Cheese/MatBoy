import datetime
import sqlalchemy as sa
from sqlalchemy import orm
from data.db_session import BaseModel
from Typing import List


class League(BaseModel):
    __tablename__ = "leagues"
    __repr_attrs__ = ["title", "chief"]
    serialize_only = ("id",
                      "title",
                      "description",
                      "chief.id",
                      "chief.email",
                      "chief.fullname",
                      "tournament.id",
                      "tournament.title",
                      "teams.id",
                      "teams.name",
                      )

    title = sa.Column(sa.Strindg, unique=False)
    description = sa.Column(sa.Text, nullable=True)
    chief_id = sa.Column(sa.Integer, sa.ForeignKey("users.id"))
    tournament_id = sa.Column(sa.Integer, sa.ForeignKey("tournaments.id"))

    chief = orm.relationship("User", backref="leagues")
    tournament = orm.relationship("Tournament", backref="leagues")
    
    def have_permission(self, user) -> bool:
        if user.is_admin or self.chief == user:
            return True
        elif self.tournament.have_permission(user):
            return True
        else:
            return False

    def get_table(self):
        """
        Return matrix which represnt a tournament table.
        :return Tuple[List[Team], List[List[List[Game]]]]
        """
        teams = self.teams.copy()
        n = len(teams)
        indexes = {teams[i]: i for i in range(n)}
        table = [[[] for __ in range(n)] for _ in range(n)]
        for game in games:
            i, j = indexes[game.team1], indexes[game.team2]
            table[]
            
