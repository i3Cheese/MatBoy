from app import db
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy_mixins import ReprMixin, SerializeMixin, TimestampsMixin



class BaseModel(db.Model, ReprMixin, SerializeMixin, TimestampsMixin):
    __abstract__ = True
    
    def fill(self, **kwargs):
        for name in kwargs.keys():
            setattr(self, name, kwargs[name])
        return self

    

class User(BaseModel, UserMixin):
    __tablename__ = "users"
    __repr_attrs__ = ["surname", "name"]

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    surname = db.Column(db.String, nullable=False)
    name = db.Column(db.String, nullable=False)
    patronymic = db.Column(db.String, nullable=True)
    city = db.Column(db.String, nullable=True)
    birthday = db.Column(db.Date)
    email = db.Column(db.String, index=True, unique=True, nullable=True)
    hashed_password = db.Column(db.String, nullable=True)
    is_creator = db.Column(db.Boolean, default=False)
    
    def __str__(self):
        return f"{self.surname} {self.name} {self.patronymic}"

    def set_password(self, password):
        self.hashed_password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.hashed_password, password)

    
class Game(BaseModel):
    __tablename__ = "games"
    __repr_attrs__ = ["team1", "team2", "league", "start"]

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    place = db.Column(db.String, nullable=True)
    start = db.Column(db.DateTime, nullable=True)
    team1_id = db.Column(db.Integer, db.ForeignKey("teams.id"))
    team2_id = db.Column(db.Integer, db.ForeignKey("teams.id"))
    league_id = db.Column(db.Integer, db.ForeignKey("leagues.id"))
    protocol = db.Column(db.Text, nullable=True)
    finish = db.Column(db.Boolean, default=False)

    team1 = db.relationship("Team", backref="games_1", foreign_keys=[team1_id,])
    team2 = db.relationship("Team", backref="games_2", foreign_keys=[team2_id,])
    league = db.relationship("League", backref="games")
    

class League(BaseModel):
    __tablename__ = "leagues"
    __repr_attrs__ = ["title", "chief"]

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String, unique=True)
    description = db.Column(db.Text, nullable=True)
    chief_id = db.Column(db.Integer, db.ForeignKey("users.id"))

    chief = db.relationship("User", backref="leagues")
    

users_to_teams = db.Table('users_to_teams', BaseModel.metadata,
    db.Column('user', db.Integer, 
                      db.ForeignKey('users.id')),
    db.Column('team', db.Integer, 
                      db.ForeignKey('teams.id'))
)


class Team(BaseModel):
    __tablename__ = "teams"
    __repr_attrs__ = ["name", "tournament"]

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String)
    motto = db.Column(db.String, nullable=True)
    trainer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    tournament_id = db.Column(db.Integer, db.ForeignKey("tournaments.id"), nullable=True)
    league_id = db.Column(db.Integer, db.ForeignKey("leagues.id"), nullable=True)

    trainer = db.relationship("User", backref="teams_for_train")
    tournament = db.relationship("Tournament", backref="teams")
    league = db.relationship("League", backref="teams")

    players = db.relationship("User", secondary="users_to_teams", backref="teams")
    

class Tournament(BaseModel):
    __tablename__ = "tournaments"
    __repr_attrs__ = ["title", "chief"]

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String, unique=True)
    description = db.Column(db.Text, nullable=True)
    place = db.Column(db.String, nullable=True)
    start = db.Column(db.Date, nullable=True)
    end = db.Column(db.Date, nullable=True)
    chief_id = db.Column(db.Integer, db.ForeignKey("users.id"))

    chief = db.relationship("User", backref="tournaments")
    