import datetime
import sqlalchemy as sa
from sqlalchemy import orm

from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin, AnonymousUserMixin, current_user
import werkzeug

from data.base_model import BaseModel, FormatSerializerMixin, ReprMixin


class User(BaseModel, UserMixin, ):
    __tablename__ = "users"

    id = BaseModel.id
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


    def set_password(self, password):
        self.hashed_password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.hashed_password, password)


    """User interface for both User and AnonymousUser classes"""
    __repr_attrs__ = ["surname", "name"]

    serialize_only = ("id",
                      "name",
                      "surname",
                      "patronymic",
                      "fullname",
                      "city",
                      "birthday",
                      "years_old",
                      "email",
                      "is_creator",
                      "edit_access",
                      )
    sensitive_fields = ('email', "is_creator")

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
        today = datetime.date.today()
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

    def have_permission(self, user):
        return user.is_admin or user == self

    @property
    def edit_access(self):
        return self.have_permission(current_user)


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
