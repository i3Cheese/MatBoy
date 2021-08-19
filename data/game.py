import sqlalchemy as sa
from sqlalchemy import orm
from data.base_model import BaseModel
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
    status = sa.Column(sa.String(10), default='created', nullable=False)
    """
    0 - deleted
    1 - created
    2 - started
    3 - finished
    """
    judge_id = sa.Column(sa.Integer, sa.ForeignKey("users.id"))
    team1_id = sa.Column(sa.Integer, sa.ForeignKey("teams.id"), nullable=False)
    team2_id = sa.Column(sa.Integer, sa.ForeignKey("teams.id"), nullable=False)
    league_id = sa.Column(sa.Integer, sa.ForeignKey("leagues.id"), nullable=False)

    judge = orm.relationship("User")
    team1 = orm.relationship("Team", back_populates="games_1",
                             foreign_keys=[team1_id])
    team2 = orm.relationship("Team", back_populates="games_2",
                             foreign_keys=[team2_id])
    league = orm.relationship("League", back_populates="games")
    protocol = orm.relationship("Protocol", uselist=False, back_populates='game')

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
        self.status = 'deleted'

    def restore(self):
        self.status = 'created'

    def start_game(self):
        self.status = 'started'

    def finish(self):
        self.set_result()
        self.status = 'finished'


class Protocol(BaseModel):
    __tablename__ = "protocols"
    __repr_attrs__ = []

    game_id = sa.Column(sa.Integer, sa.ForeignKey('games.id'), unique=True)
    game = orm.relationship('Game', back_populates='protocol')

    captain_id = sa.Column(sa.Integer, sa.ForeignKey('users.id'), nullable=True, )
    captain = orm.relationship('User', foreign_keys=captain_id)

    deputy_id = sa.Column(sa.Integer, sa.ForeignKey('users.id'), nullable=True)
    deputy = orm.relationship('User', foreign_keys=deputy_id)

    rounds = orm.relationship('Round', back_populates='protocol')

    captain_task = sa.Column(sa.Text, nullable=True)
    captain_winner_id = sa.Column(sa.Integer, sa.ForeignKey('teams.id'), nullable=True)
    captain_winner = orm.relationship('Team')

    additional = sa.Column(sa.Text, default='', nullable=False)


class Round(BaseModel):
    __tablename__ = "rounds"

    protocol_id = sa.Column(sa.Integer, sa.ForeignKey('protocols.id'), nullable=False)
    protocol = orm.relationship('Protocol', back_populates='rounds')

    team1_data_id = sa.Column(sa.Integer, sa.ForeignKey('teams_round_data.id'), nullable=False)
    team1_data = orm.relationship('TeamRoundData', foreign_keys=team1_data_id)
    team2_data_id = sa.Column(sa.Integer, sa.ForeignKey('teams_round_data.id'), nullable=False)
    team2_data = orm.relationship('TeamRoundData', foreign_keys=team2_data_id)

    additional = sa.Column(sa.String, sa.Text, default='', nullable=False)


players_to_team_round_data = sa.Table(
    'players_to_team_round_data', BaseModel.metadata,
    sa.Column('user_id', sa.ForeignKey('users.id'), primary_key=True),
    sa.Column('team_round_data_id', sa.ForeignKey('users.id'), primary_key=True),
)


class TeamRoundData(BaseModel):
    __tablename__ = "teams_round_data"
    points = sa.Column(sa.Integer, nullable=False)
    stars = sa.Column(sa.Integer, default=0, nullable=False)

    players = orm.relationship("User", secondary=players_to_team_round_data)
