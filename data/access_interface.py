import abc
import typing as t

import flask_login


class AccessInterface:
    @abc.abstractmethod
    def have_full_access(self, user) -> bool:
        return user.is_admin

    @abc.abstractmethod
    def have_manage_access(self, user) -> bool:
        return self.have_full_access(user)

    def full_access(self) -> bool:
        if flask_login.current_user is None:
            return False
        return self.have_full_access(flask_login.current_user)

    def manage_access(self) -> bool:
        if flask_login.current_user is None:
            return False
        return self.have_manage_access(flask_login.current_user)
