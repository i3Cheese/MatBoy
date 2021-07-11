import sqlalchemy as sa
from sqlalchemy import orm
from data.base_model import BaseModel

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
    __repr_attrs__ = ["title", "id"]
    serialize_only = ("id",
                      "title",
                      "description",
                      "chief",
                      "place",
                      "start",
                      "end",
                      "link",
                      )

    title = sa.Column(sa.String, nullable=False)
    description = sa.Column(sa.Text)
    place = sa.Column(sa.String, nullable=False)
    start = sa.Column(sa.Date, nullable=False)
    end = sa.Column(sa.Date, nullable=False)
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
