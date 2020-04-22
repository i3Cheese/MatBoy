import datetime
import sqlalchemy as sa
from sqlalchemy import orm
from data.db_session import BaseModel


class League(BaseModel):
    __tablename__ = "leagues"
    __repr_attrs__ = ["title", "chief"]
    serialize_only = ("id",
                      "title",
                      "description",
                      "chief.id",
                      "chief.email",
                      "chief.fullname",
                      "tournament.id",
                      "tournament.title",
                      "teams.id",
                      "teams.name",
                      )

    title = sa.Column(sa.String, unique=False)
    description = sa.Column(sa.Text, nullable=True)
    chief_id = sa.Column(sa.Integer, sa.ForeignKey("users.id"))
    tournament_id = sa.Column(sa.Integer, sa.ForeignKey("tournaments.id"))

    chief = orm.relationship("User", backref="leagues")
    tournament = orm.relationship("Tournament", backref="leagues")
    
    def have_permission(self, user) -> bool:
        if user.is_admin or self.chief == user:
            return True
        elif self.tournament.have_permission(user):
            return True
        else:
            return False
