import typing as t

from sqlalchemy_serializer import SerializerMixin
import flask_login

from data.access_interface import AccessInterface


class SecureSerializerMixin(SerializerMixin):
    _serialize_only: t.Optional[tuple[str]] = None
    _sensitive_fields: t.Optional[tuple[str]] = None

    @property
    def serialize_only(self) -> t.Optional[tuple[str]]:
        if self._serialize_only is None:
            return None
        elif self._sensitive_fields is None:
            return self._serialize_only
        # elif isinstance(self, AccessInterface) and not self.have_manage_access(flask_login.current_user):
        #     return self._serialize_only
        # else:
        return tuple(list(self._serialize_only) + list(self._sensitive_fields))

