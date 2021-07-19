from flask_restful import reqparse, abort, Resource, request
from flask_restful.inputs import boolean
from flask import jsonify
from flask_login import current_user, login_required
from data import User, Team, Tournament, League, Game, Post, get_session
from data.user import AnonymousUser
from datetime import date, datetime
import logging


def abort_if_email_exist(session, email):
    user = session.query(User).filter(User.email == email).first()
    logging.info(repr(user))
    if user is not None:
        abort(
            409, message=f"Пользователь с e-mail {repr(email)} уже зарегестрирован")


def to_dict(obj):
    """Serialize object with check permissions"""
    if obj.have_permission(current_user) or (isinstance(obj, User) and obj == current_user):
        return obj.to_dict()
    else:
        return obj.to_secure_dict()


__all__ = ['abort_if_email_exist', 'to_dict']
