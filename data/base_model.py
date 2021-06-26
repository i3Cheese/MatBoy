import sqlalchemy as sa
import sqlalchemy.ext.declarative as dec
from sqlalchemy_mixins import ReprMixin, TimestampsMixin
from sqlalchemy_serializer import SerializerMixin
from data.db_session import SqlAlchemyBase


class FormatSerializerMixin(SerializerMixin):
    date_format = '%d.%m.%Y'
    datetime_format = '%d.%m.%Y %H:%M:%S.%f'
    time_format = '%H:%M.%f'
    short_serialize_only = ()
    secure_serialize_only = ()

    def to_short_dict(self):
        return self.to_dict(only=self.short_serialize_only)

    def to_secure_dict(self):
        return self.to_dict(only=self.secure_serialize_only)


class BaseModel(SqlAlchemyBase, FormatSerializerMixin, ReprMixin, TimestampsMixin):
    __abstract__ = True
    short_serialize_only = ('id',)

    id = sa.Column(sa.Integer, primary_key=True, autoincrement=True)

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