import sqlalchemy as sa
from sqlalchemy import orm
from data.base_model import BaseModel
from sqlalchemy_json import NestedMutableJson
from data.exceptions import StatusError


class Game(BaseModel):
    __tablename__ = "games"
    __repr_attrs__ = ["team1", "team2", "league", "start"]
    serialize_only = ("id",
                      "title",
                      "place",
                      "start",
                      "status",
                      "judge",
                      "team1",
                      "team2",
                      "league",
                      "edit_access",
                      )

    place = sa.Column(sa.String, nullable=True)
    start = sa.Column(sa.DateTime, nullable=True)
    protocol = sa.Column(NestedMutableJson)
    status = sa.Column(sa.Integer, default=1)
    """
    0 - deleted
    1 - created
    2 - started
    3 - finished
    """
    judge_id = sa.Column(sa.Integer, sa.ForeignKey("users.id"))
    team1_id = sa.Column(sa.Integer, sa.ForeignKey("teams.id"))
    team2_id = sa.Column(sa.Integer, sa.ForeignKey("teams.id"))
    league_id = sa.Column(sa.Integer, sa.ForeignKey("leagues.id"))

    judge = orm.relationship("User", backref="judged_games")
    team1 = orm.relationship("Team", backref="games_1",
                             foreign_keys=[team1_id, ])
    team2 = orm.relationship("Team", backref="games_2",
                             foreign_keys=[team2_id, ])
    league = orm.relationship("League", backref="games")

    @property
    def title(self):
        return f"{self.team1.name} — {self.team2.name}"

    def __str__(self):
        return self.title

    def have_permission(self, user) -> bool:
        """Check if user has access to this game"""
        return user.is_admin or self.judge == user or self.league.have_permission(user)

    @property
    def link(self) -> str:
        return self.league.link + "/game/{0}".format(self.id)

    def check_relation(self, tour_id, league_id) -> bool:
        return league_id == self.league_id and self.league.check_relation(tour_id)

    @staticmethod
    def default_round():
        return {'teams': [{'player': 0,
                           'points': 0,
                           'stars': 0},
                          {'player': 0,
                           'points': 0,
                           'stars': 0}],
                'problem': 0,
                'type': 1,
                'additional': "",
                }

    @property
    def teams(self):
        return [self.team1, self.team2]

    @property
    def captain_winner(self):
        team_id = self.protocol.get('captain_winner', {'id': 0})['id']
        for team in self.teams:
            if team.id == team_id:
                return team
        return None

    @captain_winner.setter
    def captain_winner(self, team_data):
        """:team_data - Union[int, Team]"""
        if isinstance(team_data, int):
            if team_data == 0:
                self.protocol.pop('captain_winner', None)
                return
            for team in self.teams:
                if team.id == team_data:
                    self.protocol['captain_winner'] = team.to_short_dict()
                    return
            raise ValueError("Team doesn't participate in this game")
        else:
            if team_data in self.teams:
                self.protocol['captain_winner'] = team_data.to_short_dict()
                return
            else:
                raise ValueError("Team doesn't participate in this game")

    def result_for_team(self, num, first=0):
        if self.status < 3:
            raise StatusError
        if 'result' not in self.protocol:
            self.set_result()
        num -= first
        if num in (0, 1):
            return self.protocol['result'][num]
        else:
            raise ValueError

    def set_result(self):
        points = self.protocol['points']
        if points[0] - points[1] > 3:
            self.protocol['result'] = [2, 0]
        elif points[1] - points[0] > 3:
            self.protocol['result'] = [0, 2]
        else:
            self.protocol['result'] = [1, 1]

    def delete(self):
        self.status = 0

    def restore(self):
        self.status = 1

    def start_game(self):
        self.status = 2

    def finish(self):
        self.set_result()
        self.status = 3

    @property
    def is_deleted(self):
        return self.status == 0

    def started(self):
        return self.status >= 2

    def finished(self):
        return self.status >= 3

    def deleted(self):
        return self.status <= 0

    def swap_teams(self):
        self.team1, self.team2 = self.team2, self.team1
        if 'teams' in self.protocol:
            self.protocol['teams'].reverse()

        if 'rounds' in self.protocol:
            for round in self.protocol['rounds']:
                round['teams'].reverse()
                round['type'] = ((round['type'] - 1) ^ 1) + 1
        if 'points' in self.protocol:
            points = self.protocol['points']
            points[0], points[1] = points[1], points[0]
        if 'stars' in self.protocol:
            self.protocol['stars'].reverse()
