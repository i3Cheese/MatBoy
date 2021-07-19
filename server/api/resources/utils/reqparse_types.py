import json
from datetime import date, datetime

from data import User


class ModelId:
    def __init__(self, cls: type):
        self.cls = cls

    def __call__(self, value, name):
        print(value, name)
        res = self.cls.query.get(value)
        if not res:
            raise ValueError(f"Parameter {name} isn't existing id of {self.cls.__name__}")
        return res


def user_type(value):
    if isinstance(value, str):
        value = json.loads(value)
    if 'id' in value:
        user = User.query.get(value['id'])
    elif 'email' in value:
        user = User.query.filter_by(email=value['email'].lower()).first()
    else:
        raise ValueError(f"Not found any details")

    if user is None:
        raise ValueError(f"Not found user")
    return user


def lower(value):
    return str(value).lower()


def date_type(strdate: str):
    if not strdate:
        return None
    return date.fromisoformat(strdate)


def datetime_type(strdatetime: str):
    if not strdatetime:
        return None
    return datetime.fromisoformat(strdatetime)


__all__ = ['ModelId', 'user_type', 'lower', 'datetime_type', 'date_type']
