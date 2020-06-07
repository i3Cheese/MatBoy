import sqlalchemy as sa
from sqlalchemy import orm
from data.db_session import BaseModel

subscribe_user_to_tournament_email = sa.Table('subscribe_user_to_tournament_email',
                                              BaseModel.metadata,
                                              sa.Column('user', sa.Integer,
                                                        sa.ForeignKey('users.id')),
                                              sa.Column('tournament', sa.Integer,
                                                        sa.ForeignKey('tournaments.id')))

subscribe_user_to_tournament_vk = sa.Table('subscribe_user_to_tournament_vk',
                                           BaseModel.metadata,
                                           sa.Column('user', sa.Integer,
                                                     sa.ForeignKey('users.id')),
                                           sa.Column('tournament', sa.Integer,
                                                     sa.ForeignKey('tournaments.id')))


class Tournament(BaseModel):
    __tablename__ = "tournaments"
    __repr_attrs__ = ["title", "chief"]
    serialize_only = ("id",
                      "title",
                      "chief.id",
                      "chief.email",
                      "chief.fullname",
                      "place",
                      "start",
                      "end",
                      "link",
                      )

    short_serialize_only = ("id",
                            "title",
                            )

    title = sa.Column(sa.String, unique=True)
    description = sa.Column(sa.Text, nullable=True)
    place = sa.Column(sa.String, nullable=True)
    start = sa.Column(sa.Date, nullable=True)
    end = sa.Column(sa.Date, nullable=True)
    chief_id = sa.Column(sa.Integer, sa.ForeignKey("users.id"))

    chief = orm.relationship("User", backref="tournaments")

    users_subscribe_email = orm.relationship(
        "User", secondary="subscribe_user_to_tournament_email", backref="tours_subscribe_email"
    )
    users_subscribe_vk = orm.relationship(
        "User", secondary="subscribe_user_to_tournament_vk", backref="tours_subscribe_vk"
    )

    def have_permission(self, user):
        return user.is_admin or self.chief == user

    def __str__(self):
        return self.title

    @property
    def link(self) -> str:
        return "/tournament/{0}".format(self.id)
