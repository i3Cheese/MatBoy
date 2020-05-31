import datetime
import sqlalchemy as sa
from sqlalchemy import orm
from data.db_session import BaseModel


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
                      "link",
                      )

    title = sa.Column(sa.String, unique=False)
    description = sa.Column(sa.Text, nullable=True)
    chief_id = sa.Column(sa.Integer, sa.ForeignKey("users.id"))
    tournament_id = sa.Column(sa.Integer, sa.ForeignKey("tournaments.id"))

    chief = orm.relationship("User", backref="leagues")
    tournament = orm.relationship("Tournament", backref="leagues")
    
    def __str__(self):
        return self.title
        
    def have_permission(self, user) -> bool:
        if user.is_admin or self.chief == user:
            return True
        elif self.tournament.have_permission(user):
            return True
        else:
            return False

    @property
    def link(self) -> str:
        return self.tournament.link + "/league/{0}".format(self.id)

    def check_relation(self, tour_id) -> bool:
        return self.tournament_id == tour_id

    def get_table(self, non_ended=False):
        """
        Return matrix which represnt a tournament table.
        :return Tuple[List[Team], List[List[List[Tuple[int, Game]]]], List[int]]
        """
        teams = self.teams.copy()
        n = len(teams)
        indexes = {teams[i]: i for i in range(n)}
        table = [[[] for __ in range(n)] for _ in range(n)]
        result = [0] * n
        for game in self.games:
            if non_ended or game.status >= 3:
                try:
                    i, j = indexes[game.team1], indexes[game.team2]
                    r1 = game.result_for_team(1, 1)
                    r2 = game.result_for_team(2, 1)
                    table[i][j].append((r1, game,))
                    table[j][i].append((r2, game,))
                    result[i] += r1
                    result[j] += r2
                except KeyError:  # Команду могут удалить из лиги, но оставить игру
                    pass
        return (teams, table, result)
