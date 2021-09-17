import datetime as dt

import sqlalchemy as sa
from sqlalchemy import orm

from data.access_group import AccessMixin, AccessGroup
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


class Tournament(AccessMixin, BaseModel):
    __tablename__ = "tournaments"
    __repr_attrs__ = ["title"]
    _serialize_only = ("id",
                       "title",
                       "description",
                       "chief",
                       "place",
                       "start_time",
                       "end_time",
                       "manage_access",
                       "full_access",
                       )
    _sensitive_fields = (
        "access_group",
    )

    id = sa.Column(sa.Integer, primary_key=True, autoincrement=True)
    title = sa.Column(sa.String, nullable=False)
    description = sa.Column(sa.Text, nullable=None, default='')
    place = sa.Column(sa.String, nullable=False)
    start_time = sa.Column(sa.Date, nullable=False)
    end_time = sa.Column(sa.Date, nullable=False)
    chief_id = sa.Column(sa.Integer, sa.ForeignKey("users.id"))
    chief = orm.relationship("User")

    leagues = orm.relationship("League", back_populates="tournament")
    teams = orm.relationship('Team', back_populates='tournament')
    posts = orm.relationship('Post', back_populates='tournament')

    users_subscribe_email = orm.relationship(
        "User", secondary="subscribe_user_to_tournament_email", backref="tours_subscribe_email"
    )
    users_subscribe_vk = orm.relationship(
        "User", secondary="subscribe_user_to_tournament_vk", backref="tours_subscribe_vk"
    )

    def __init__(self, *args,
                 title: str,
                 place: str,
                 start: dt.date,
                 end: dt.date, chief,
                 description: str = '',
                 **kwargs):
        parent_access_group = AccessGroup(members=[chief])
        super().__init__(*args, parent_access_group=parent_access_group, **kwargs)
        self.title = title
        self.place = place
        self.start_time = start
        self.end_time = end
        self.chief = chief
        self.description = description

    def __str__(self):
        return self.title

    @property
    def link(self) -> str:
        return "/tournament/{0}".format(self.id)
