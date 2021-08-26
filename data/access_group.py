import sqlalchemy as sa
from sqlalchemy import orm
import flask_login

from data.access_interface import AccessInterface

from data.base_model import BaseModel


class DefaultAccess(AccessInterface):
    def have_full_access(self, user) -> bool:
        return user.is_admin

    def have_manage_access(self, user) -> bool:
        return self.have_full_access(user)


users_to_access_groups = sa.Table(
    'users_to_access_groups', BaseModel.metadata,
    sa.Column('user_id', sa.ForeignKey('users.id'), primary_key=True),
    sa.Column('access_group_id', sa.ForeignKey('access_groups.id'), primary_key=True),
)


class AccessGroup(BaseModel, DefaultAccess):
    __tablename__ = "access_groups"
    _serialize_only = (
        "id",
        "manage_access",
        "full_access",
    )
    _sensitive_fields = (
        "members",
    )

    id = sa.Column(sa.Integer, primary_key=True, autoincrement=True)
    members = orm.relationship('User', secondary=users_to_access_groups)

    parent_access_group_id = sa.Column(sa.Integer, sa.ForeignKey('access_groups.id'))
    parent_access_group = orm.relationship("AccessGroup", remote_side=[id])

    def have_manage_access(self, user) -> bool:
        return user in self.members or super().have_manage_access(user)

    def have_full_access(self, user) -> bool:
        return (self.parent_access_group is not None and
                self.parent_access_group.have_full_access(user)) or super().have_full_access(user)


@orm.declarative_mixin
class AccessMixin(DefaultAccess):
    # noinspection PyMethodMayBeStatic
    def have_full_access(self, user) -> bool:
        return self.access_group.have_full_access(user)

    def have_manage_access(self, user) -> bool:
        return self.access_group.have_manage_access(user)

    @orm.declared_attr
    def access_group_id(cls):
        return sa.Column('access_group_id', sa.ForeignKey('access_groups.id'))

    @orm.declared_attr
    def access_group(cls):
        return orm.relationship("AccessGroup", backref=cls.__tablename__)

    def __init__(self):
        super().__init__()
        self.access_group = AccessGroup()
