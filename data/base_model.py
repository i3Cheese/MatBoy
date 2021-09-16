import typing as t
import functools

import sqlalchemy as sa
import sqlalchemy.ext.declarative as dec
from sqlalchemy.orm import Query
from sqlalchemy_mixins import ReprMixin, TimestampsMixin
from flask_login import current_user

from data.secure_serializer import SecureSerializerMixin
from data.db_tools import SqlAlchemyBase, db_session


class BaseModel(SqlAlchemyBase, SecureSerializerMixin, ReprMixin, TimestampsMixin):
    __abstract__ = True
    short_serialize_only = ('id',)
    date_format = '%Y-%m-%d'
    datetime_format = '%Y-%m-%d %H:%M:%S%z'

    query: Query = db_session.query_property()
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def fill(self, **kwargs):
        """Set the attibutes. Equal to self.key = value.
        It's raise AttributeError if key isn't class attribute"""
        for name in kwargs.keys():
            setattr(self, name, kwargs[name])
        return self

    def __eq__(self, other):
        if other is None:
            return False
        elif type(self) == type(other):
            return hash(self) == hash(other.id)
        else:
            super(BaseModel, self).__eq__(other)
            # raise TypeError(f"{type(self)} not compatible with {type(other)}")

    __primary_keys: t.Optional[list[sa.Column]] = None

    @classmethod
    @property
    def _primary_keys(cls) -> list[sa.Column]:
        if cls.__primary_keys is None:
            cls.__primary_keys = sa.inspect(cls).primary_key
        return cls.__primary_keys

    def __hash__(self):
        return hash(tuple(getattr(self, col.name) for col in self._primary_keys))

    def have_permission(self, user):
        """Check if user can edit self"""
        return user.is_admin

    def edit_access(self):
        """
        have_permission for current_user
        only with request context
        """
        return self.have_permission(current_user)