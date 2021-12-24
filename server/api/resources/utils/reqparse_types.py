import json
from datetime import date, datetime
from dateutil import parser

from data import User, Team, League, Tournament, Game


class ModelId:
    def __init__(self, cls):
        self.cls = cls

    def __call__(self, value, name):
        res = self.cls.query.get(value)
        if not res:
            raise ValueError(f"Parameter {name} isn't existing id of {self.cls.__name__}")
        return res


def model_with_id(cls):
    def _model_with_id(value, name):
        if 'id' not in value:
            raise ValueError(f"Not passed id in parameter {name}")
        res = cls.query.get(value['id'])
        if res is None:
            raise ValueError(f"Parameter {name} isn't existing id of {cls.__name__}")
        return res

    return _model_with_id


team_type = model_with_id(Team)
tournament_type = model_with_id(Tournament)
league_type = model_with_id(League)
game_type = model_with_id(Game)


def user_type(should_exist=True):
    def _user_type(value):
        if isinstance(value, str):
            value = json.loads(value)
        if 'id' in value:
            user = User.query.get(value['id'])
        elif 'email' in value:
            user = User.query.filter_by(email=value['email'].lower()).first()
        else:
            raise ValueError(f"Not found any details")
        if user is None and should_exist:
            raise ValueError(f"Not found user")
        return user
    return _user_type


def lower(value):
    return str(value).lower()


def date_type(strdate: str):
    if not strdate:
        return None
    return parser.parse(strdate).date()


def datetime_type(strdatetime: str):
    if not strdatetime:
        return None
    return parser.parse(strdatetime)


__all__ = [
    'ModelId',
    'user_type',
    'lower',
    'datetime_type',
    'date_type',
    'team_type',
    'league_type',
    'tournament_type',
    'game_type',
]
