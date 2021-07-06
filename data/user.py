import datetime
import sqlalchemy as sa
from data.base_model import BaseModel, FormatSerializerMixin, ReprMixin
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin, AnonymousUserMixin
import werkzeug


class UserInterface:
    """User interface for both User and AnonymousUser classes"""
    __repr_attrs__ = ["surname", "name"]

    serialize_only = ("id",
                      "name",
                      "surname",
                      "patronymic",
                      "fullname",
                      "city",
                      "birthday",
                      "email",
                      "is_creator",
                      "link",
                      )
    sensitive_fields = ('email', )

    def to_dict(self, only=None):
        res = {}
        only = only or self.serialize_only
        for field_name in only:
            res[field_name] = getattr(self, field_name)
        return res

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

    id = 0
    surname = ''
    name = ''
    patronymic = None
    city = None
    birthday = datetime.date(1970, 1, 1)
    email = "mail@example.com"
    hashed_password = None
    is_creator = False
    vk_id = 0
    integration_with_VK = False
    email_notifications = False
    vk_notifications = False

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


class User(UserInterface, BaseModel, UserMixin,):
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

    def set_password(self, password):
        self.hashed_password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.hashed_password, password)


class AnonymousUser(AnonymousUserMixin, UserInterface):
    pass
