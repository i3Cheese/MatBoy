import datetime as dt
import typing as t

import sqlalchemy as sa
import werkzeug
from flask_login import UserMixin, AnonymousUserMixin
from sqlalchemy import orm
from werkzeug.security import generate_password_hash, check_password_hash

from data.access_group import DefaultAccess
from data.base_model import BaseModel


class User(BaseModel, UserMixin, DefaultAccess):
    __tablename__ = "users"

    __repr_attrs__ = ["surname", "name"]

    _serialize_only = ("id",
                       "name",
                       "surname",
                       "patronymic",
                       "fullname",
                       "city",
                       "birthday",
                       "years_old",
                       "email",
                       "is_creator",
                       )
    _sensitive_fields = ('email', "is_creator",)

    def have_manage_access(self, user) -> bool:
        return user == self or super().have_manage_access(user)

    id = sa.Column(sa.Integer, primary_key=True, autoincrement=True)
    surname = sa.Column(sa.String, nullable=False)
    name = sa.Column(sa.String, nullable=False)
    patronymic = sa.Column(sa.String, nullable=True)
    city = sa.Column(sa.String, nullable=True)
    birthday = sa.Column(sa.Date)
    email = sa.Column(sa.String, index=True, unique=True)
    hashed_password = sa.Column(sa.String, nullable=True)
    is_creator = sa.Column(sa.Boolean, default=False)
    vk_id = sa.Column(sa.Integer, default=0)
    integration_with_VK = sa.Column(sa.Boolean, default=False)
    email_notifications = sa.Column(sa.Boolean, default=False)
    vk_notifications = sa.Column(sa.Boolean, default=False)

    teams = orm.relationship('Team', secondary='users_to_teams', back_populates='players')

    def __init__(self, *args,
                 surname: str,
                 name: str,
                 patronymic: t.Optional[str] = None,
                 city: t.Optional[str] = None,
                 birthday: dt.date,
                 email: str,
                 password: t.Optional[str] = None,
                 **kwargs):
        super().__init__(*args, **kwargs)
        self.surname = surname
        self.name = name
        self.patronymic = patronymic
        self.city = city
        self.birthday = birthday
        self.email = email
        if password is not None:
            self.set_password(password)

    def set_password(self, password):
        self.hashed_password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.hashed_password, password)

    @property
    def fullname(self):
        if self.patronymic:
            return "{0} {1} {2}".format(self.surname, self.name, self.patronymic)
        else:
            return "{0} {1}".format(self.surname, self.name)

    @property
    def link(self) -> str:
        return "/profile/{0}".format(self.id)

    def __str__(self):
        return self.fullname

    @property
    def years_old(self):
        today = dt.date.today()
        birth = self.birthday
        years = today.year - birth.year
        if int(today.strftime("%j")) < int(birth.strftime("%j")):
            years -= 1
        return years

    @property
    def is_admin(self):
        return self.id == 1

    def __eq__(self, other):
        if isinstance(other, (User, AnonymousUser, werkzeug.local.LocalProxy)):
            return self.id == other.id
        elif other is None:
            return False
        else:
            raise TypeError


class AnonymousUser(AnonymousUserMixin):
    id = 0
    is_admin = False

    def __eq__(self, other):
        if isinstance(other, (User, AnonymousUser, werkzeug.local.LocalProxy)):
            return self.id == other.id
        elif other is None:
            return False
        else:
            raise TypeError
