import datetime as dt

import sqlalchemy as sa
from sqlalchemy import orm
from data.base_model import BaseModel
from data.exceptions import StatusError
from data.access_group import AccessMixin, DefaultAccess

import typing as t


class Game(AccessMixin, BaseModel):
    __tablename__ = "games"
    __repr_attrs__ = ["league_id", "start"]
    _serialize_only = ("id",
                       "title",
                       "place",
                       "start",
                       "status",
                       "league",
                       "team1",
                       "team2",
                       "protocol",
                       "full_access",
                       "manage_access",
                       )
    _sensitive_fields = ("access_group",)

    id = sa.Column(sa.Integer, primary_key=True, autoincrement=True)
    place = sa.Column(sa.String, nullable=True)
    start = sa.Column(sa.DateTime, nullable=True)
    status: t.Literal['deleted', 'created', 'started', 'finished'] = sa.Column(
        sa.String(10), default='created', nullable=False
    )
    """
    0 - deleted
    1 - created
    2 - started
    3 - finished
    """
    team1_id = sa.Column(sa.Integer, sa.ForeignKey("teams.id"), nullable=False)
    team2_id = sa.Column(sa.Integer, sa.ForeignKey("teams.id"), nullable=False,
                         )
    team1 = orm.relationship("Team", back_populates="games_1",
                             foreign_keys=[team1_id])
    team2 = orm.relationship("Team", back_populates="games_2",
                             foreign_keys=[team2_id])

    league_id = sa.Column(sa.Integer, sa.ForeignKey("leagues.id"), nullable=False)
    league = orm.relationship("League", back_populates="games")

    protocol = orm.relationship("Protocol", uselist=False, back_populates='game', cascade="all, delete-orphan")

    def __init__(self, *args,
                 place: t.Optional[str] = None,
                 start: t.Optional[dt.datetime] = None,
                 team1,
                 team2,
                 league,
                 **kwargs):
        super().__init__(parent_access_group=league.access_group)
        self.place = place
        self.start = start
        self.team1 = team1
        self.team2 = team2
        self.league = league

        self.protocol = Protocol(game=self)

    @property
    def title(self):
        return f"{self.team1.name} — {self.team2.name}"

    def __str__(self):
        return self.title

    @property
    def link(self) -> str:
        return self.league.link + "/game/{0}".format(self.id)

    def check_relation(self, tour_id, league_id) -> bool:
        return league_id == self.league_id and self.league.check_relation(tour_id)

    @property
    def teams(self):
        return [self.team1, self.team2]

    @property
    def is_deleted(self):
        return self.status == 'deleted'

    def delete(self):
        self.status = 'deleted'

    def restore(self):
        self.status = 'created'

    def start_game(self):
        self.status = 'started'

    def finish(self):
        self.status = 'finished'


class Protocol(BaseModel, DefaultAccess):
    __tablename__ = "protocols"
    __repr_attrs__ = ['game_id', ]

    _serialize_only = (
        'rounds',
        'captain_task',
        'captain_winner',
        'team1_data',
        'team2_data',
        'additional',
        'updated_at',
    )

    def have_full_access(self, user) -> bool:
        return self.game.have_full_access(user)

    def have_manage_access(self, user) -> bool:
        return self.game.have_manage_access(user)

    game_id = sa.Column(sa.Integer, sa.ForeignKey('games.id'), unique=True, primary_key=True)
    game = orm.relationship('Game', back_populates='protocol')

    rounds = orm.relationship("Round", order_by="Round.order", back_populates='protocol', cascade="all, delete-orphan")

    captain_task = sa.Column(sa.Text, nullable=True)
    captain_winner_id = sa.Column(sa.Integer, sa.ForeignKey('teams.id'), nullable=True)
    captain_winner = orm.relationship('Team')

    team1_data_id = sa.Column(sa.Integer, sa.ForeignKey('teams_protocol_data.id'), nullable=False)
    team1_data = orm.relationship('TeamProtocolData', foreign_keys=team1_data_id,
                                  cascade="all, delete-orphan", single_parent=True)
    team2_data_id = sa.Column(sa.Integer, sa.ForeignKey('teams_protocol_data.id'), nullable=False)
    team2_data = orm.relationship('TeamProtocolData', foreign_keys=team2_data_id,
                                  cascade="all, delete-orphan", single_parent=True)

    additional = sa.Column(sa.Text, default='', nullable=False)

    def __init__(self, *args,
                 game: Game,
                 **kwargs):
        super().__init__(*args, **kwargs)
        self.game = game
        self.team1_data = TeamProtocolData()
        self.team2_data = TeamProtocolData()

    def clear_rounds(self):
        pass


class TeamProtocolData(BaseModel):
    __tablename__ = "teams_protocol_data"
    __repr_attrs__ = ['id']

    serialize_only = (
        'captain',
        'deputy',
    )

    def __init__(self, *args,
                 captain=None,
                 deputy=None,
                 **kwargs):
        super().__init__(*args, **kwargs)
        self.captain = captain
        self.deputy = deputy

    id = sa.Column(sa.Integer, primary_key=True, autoincrement=True)

    captain_id = sa.Column(sa.Integer, sa.ForeignKey('users.id'), nullable=True, )
    captain = orm.relationship('User', foreign_keys=captain_id)

    deputy_id = sa.Column(sa.Integer, sa.ForeignKey('users.id'), nullable=True)
    deputy = orm.relationship('User', foreign_keys=deputy_id)


class Round(BaseModel):
    __tablename__ = "rounds"
    __repr_attrs__ = ['protocol_id', 'order']

    serialize_only = (
        'order',
        'team1_data',
        'team2_data',
        'call_type',
        'problem',
        'additional',
    )

    protocol_id = sa.Column(sa.Integer, sa.ForeignKey('protocols.game_id'), primary_key=True)
    protocol = orm.relationship('Protocol',
                                back_populates='rounds',)

    def __init__(self, *,
                 order: int,
                 team1_data: t.Optional['TeamRoundData'] = None,
                 team2_data: t.Optional['TeamRoundData'] = None,
                 problem: int,
                 call_type: int,
                 additional: str = '',):
        super().__init__()
        self.order = order
        self.team1_data = team1_data
        self.team2_data = team2_data
        self.problem = problem
        self.call_type = call_type
        self.additional = additional

    order = sa.Column(sa.Integer, primary_key=True)

    team1_data_id = sa.Column(sa.Integer, sa.ForeignKey('teams_round_data.id'), nullable=False)
    team1_data = orm.relationship('TeamRoundData', foreign_keys=team1_data_id,
                                  cascade="all, delete-orphan", single_parent=True)
    team2_data_id = sa.Column(sa.Integer, sa.ForeignKey('teams_round_data.id'), nullable=False)
    team2_data = orm.relationship('TeamRoundData', foreign_keys=team2_data_id,
                                  cascade="all, delete-orphan", single_parent=True)

    problem = sa.Column(sa.Integer, nullable=False)
    call_type = sa.Column(sa.Integer, nullable=False)
    """
    1 - →
    2 - ←
    3 - ⇄
    4 - ⇆
    5 - ⥇
    6 - ⬾
    """

    additional = sa.Column(sa.String, default='', nullable=False)


players_to_team_round_data = sa.Table(
    'players_to_team_round_data', BaseModel.metadata,
    sa.Column('user_id', sa.ForeignKey('users.id'), primary_key=True),
    sa.Column('team_round_data_id', sa.ForeignKey('teams_round_data.id'), primary_key=True),
)


class TeamRoundData(BaseModel):
    __tablename__ = "teams_round_data"
    __repr_attrs__ = ['id']
    serialize_only = (
        'points',
        'stars',
        'players',
    )

    def __init__(self, *args,
                 points: int,
                 stars: int = 0,
                 players = None,
                 **kwargs):
        super(TeamRoundData, self).__init__(*args, **kwargs)

        self.points = points
        self.stars = stars
        if players is not None:
            self.players = players

    id = sa.Column(sa.Integer, primary_key=True, autoincrement=True)

    points = sa.Column(sa.Integer, nullable=False)
    stars = sa.Column(sa.Integer, default=0, nullable=False)

    players = orm.relationship("User", secondary=players_to_team_round_data)
