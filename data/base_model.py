import sqlalchemy as sa
import sqlalchemy.ext.declarative as dec
from sqlalchemy.orm import Query
from sqlalchemy_mixins import ReprMixin, TimestampsMixin
from sqlalchemy_serializer import SerializerMixin
from flask_login import current_user

from data.db_tools import SqlAlchemyBase, db_session


class FormatSerializerMixin(SerializerMixin):
    __abstract__ = True
    secure_serialize_only = ()

    def to_short_dict(self):
        # deprecated
        return self.to_secure_dict()

    def to_secure_dict(self):
        if hasattr(self, 'sensitive_fields'):
            return self.to_dict(tuple(filter(lambda s: s in self.sensitive_fields, self.serialize_only)))
        elif hasattr(self, 'secure_serialize_only'):
            return self.to_dict(only=self.secure_serialize_only)
        else:
            return self.to_dict()


class BaseModel(SqlAlchemyBase, FormatSerializerMixin, ReprMixin, TimestampsMixin):
    __abstract__ = True
    short_serialize_only = ('id',)
    date_format = '%Y-%m-%d'
    datetime_format = '%Y-%m-%d %H:%M:%S%z'

    id = sa.Column(sa.Integer, primary_key=True, autoincrement=True)
    query: Query = db_session.query_property()

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
            return self.id == other.id
        else:
            raise TypeError

    def __hash__(self):
        return hash(self.id)

    def have_permission(self, user):
        """Check if user can edit self"""
        return user.is_admin

    def edit_access(self):
        """
        have_permission for current_user
        only with request context
        """
        return self.have_permission(current_user)