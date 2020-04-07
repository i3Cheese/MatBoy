import datetime
import sqlalchemy as sa
from sqlalchemy import orm
from data.db_session import BaseModel
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin


class User(BaseModel, UserMixin):
    __tablename__ = "users"
    __repr_attrs__ = ["surname", "name"]

    id = sa.Column(sa.Integer, primary_key=True, autoincrement=True)
    surname = sa.Column(sa.String, nullable=False)
    name = sa.Column(sa.String, nullable=False)
    patronymic = sa.Column(sa.String, nullable=True)
    city = sa.Column(sa.String, nullable=True)
    birthday = sa.Column(sa.Date)
    email = sa.Column(sa.String, index=True, unique=True, nullable=True)
    hashed_password = sa.Column(sa.String, nullable=True)
    is_creator = sa.Column(sa.Boolean, default=False)
    
    def __str__(self):
        return f"{self.surname} {self.name} {self.patronymic}"

    def set_password(self, password):
        self.hashed_password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.hashed_password, password)