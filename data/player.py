import datetime
import sqlalchemy as sa
from sqlalchemy import orm
from data.db_session import BaseModel
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin


class Player(BaseModel, UserMixin):
    __tablename__ = "players"

    id = sa.Column(sa.Integer, primary_key=True, autoincrement=True)
    surname = sa.Column(sa.String, nullable=False)
    name = sa.Column(sa.String, nullable=False)
    patronymic = sa.Column(sa.String, nullable=True)
    city = sa.Column(sa.String, nullable=True)
    birthday = sa.Column(sa.DateTime, nullable=False)
    email = sa.Column(sa.String, index=True, unique=True, nullable=True)
    hashed_password = sa.Column(sa.String, nullable=True)
    created_date = sa.Column(sa.DateTime, default=datetime.datetime.now)

    
    def __init__(self, surname: str, name: str, age: int,
                       position: str, speciality: str, address: str, email: str):
        super().__init__()
        self.surname = surname
        self.name = name
        self.age = age
        self.position = position
        self.speciality = speciality
        self.address = address
        self.email = email

    def __repr__(self):
        return f'<Player> {self.id} {self.surname} {self.name}'

    def __str__(self):
        return f"{self.surname} {self.name} {self.patronymic}"

    def set_password(self, password):
        self.hashed_password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.hashed_password, password)