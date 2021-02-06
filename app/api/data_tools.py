from flask_restful import abort
from flask_login import current_user
from data import User, Team, Tournament, League, Game, Post
from datetime import date, datetime
from typing import Optional
import logging


def to_dict(obj):
    """Serialize object with check permissions"""
    if obj.have_permission(current_user) or (isinstance(obj, User) and obj == current_user):
        return obj.to_dict()
    else:
        return obj.to_secure_dict()


def get_date_from_string(strdate: str) -> Optional[date]:
    if not strdate:
        return None
    return date.fromisoformat('-'.join(reversed(strdate.split("."))))


def get_datetime_from_string(strdatetime: str) -> Optional[datetime]:
    if not strdatetime:
        return None
    dt, tm = strdatetime.split(' ')
    dt = '-'.join(reversed(dt.split('.')))
    return datetime.fromisoformat(dt + ' ' + tm)


def get_user(session, user_id=None, email=None, do_abort=True) -> Optional[User]:
    """
    Get User from database, abort(404) if do_abort==True and user not found

    If user.id and user.email specified in the same time
    user was looking by user.id
    """
    if user_id:
        user = session.query(User).get(user_id)
        if do_abort and not user:
            abort(404, message=f"Пользователь #{user_id} не найден")
    elif email:
        user = session.query(User).filter(User.email == email.lower()).first()
        if do_abort and not user:
            abort(404, message=f"Пользователь с e-mail {email} не найден")
    else:
        return None
    return user


def get_team(session, team_id, do_abort=True) -> Optional[Team]:
    """Get Team from database, abort(404) if do_abort==True and team not found"""
    team = session.query(Team).get(team_id)
    if do_abort and not team:
        abort(404, message=f"Team #{team_id} not found")
    return team


def get_tour(session, tour_id, do_abort=True) -> Optional[Tournament]:
    """Get Tournament from database, abort(404) if do_abort==True and tournament not found"""
    tour = session.query(Tournament).get(tour_id)
    if do_abort and not tour:
        abort(404, message=f"Tournament #{tour_id} not found")
    return tour


def get_league(session, league_id, do_abort=True) -> Optional[League]:
    """Get League from database, abort(404) if do_abort==True and league not found"""
    league = session.query(League).get(league_id)
    if do_abort and not league:
        abort(404, message=f"League #{league_id} not found")
    return league


def get_game(session, game_id, do_abort=True) -> Optional[Game]:
    """Get Game from database, abort(404) if do_abort==True and game not found"""
    game = session.query(Game).get(game_id)
    if do_abort and not game:
        abort(404, message=f"Game #{game_id} not found")
    return game


def get_post(session, post_id, do_abort=True) -> Post:
    """Get Post from database, abort(404) if do_abort==True and post not found"""
    post = session.query(Post).get(post_id)
    if do_abort and not post:
        abort(404, message=f"Post #{post_id} not found")
    return post


def abort_if_email_exist(session, email):
    user = session.query(User).filter(User.email == email).first()
    logging.info(repr(user))
    if user is not None:
        abort(
            409, message=f"Пользователь с e-mail {repr(email)} уже зарегестрирован", error={'email': 'exist'})
