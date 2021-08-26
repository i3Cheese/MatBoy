import typing as t

import sqlalchemy as sa
from sqlalchemy import orm

from data.access_group import AccessMixin
from data.base_model import BaseModel


class League(BaseModel, AccessMixin):
    __tablename__ = "leagues"
    __repr_attrs__ = ["id", "title", "tournament_id"]
    _serialize_only = ("id",
                       "title",
                       "description",
                       "tournament",
                       "full_access",
                       "manage_access",
                       )
    _sensitive_fields = ('access_group',)

    id = sa.Column(sa.Integer, primary_key=True, autoincrement=True)
    title = sa.Column(sa.String, nullable=False)
    description = sa.Column(sa.Text, nullable=True)
    tournament_id = sa.Column(sa.Integer, sa.ForeignKey("tournaments.id"))

    tournament: t.Final = orm.relationship("Tournament", back_populates="leagues")
    games = orm.relationship('Game', back_populates='league')
    teams = orm.relationship('Team', back_populates='league')

    def __init__(self, *args,
                 title: str,
                 description: t.Optional[str] = None,
                 tournament,
                 **kwargs):
        super().__init__(*args, **kwargs)
        self.title = title
        self.description = description
        self.tournament = tournament
        self.access_group.parent_access_group = tournament.access_group

    def __str__(self):
        return self.title

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
        teams.sort(key=lambda x: x.name)
        n = len(teams)
        indexes = {teams[i]: i for i in range(n)}
        table: list[list[list[tuple[int, 'Game']]]] = [[[] for __ in range(n)] for _ in range(n)]
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
        return teams, table, result
