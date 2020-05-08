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
    def is_deleted(self):
        return self.status == 0
    
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
            if (team_data in self.teams):
                self.protocol['captain_winner'] = team_data.to_short_dict()
                return
            else:
                raise ValueError("Team doesn't participate in this game")
