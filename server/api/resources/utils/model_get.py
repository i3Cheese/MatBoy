from flask_restful import abort
from data import User, Team, Tournament, League, Game, Post


def get_model(cls, id_, do_abort=True):
    res = cls.query.get(id_)
    if do_abort and not res:
        abort(404, message=f"{cls.__name__} #{id_} not found")
    return res


def get_user(session, user_id=None, email=None, do_abort=True):
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


def get_team(session, team_id, do_abort=True) -> Team:
    """Get Team from database, abort(404) if do_abort==True and team not found"""
    team = session.query(Team).get(team_id)
    if do_abort and not team:
        abort(404, message=f"Team #{team_id} not found")
    return team


def get_tour(session, tour_id, do_abort=True) -> Tournament:
    """Get Tournament from database, abort(404) if do_abort==True and tournament not found"""
    tour = session.query(Tournament).get(tour_id)
    if do_abort and not tour:
        abort(404, message=f"Tournament #{tour_id} not found")
    return tour


def get_league(session, league_id, do_abort=True) -> League:
    """Get League from database, abort(404) if do_abort==True and league not found"""
    league = session.query(League).get(league_id)
    if do_abort and not league:
        abort(404, message=f"League #{league_id} not found")
    return league


def get_game(session, game_id, do_abort=True) -> Game:
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


__all__ = ['get_model', 'get_post', 'get_game', 'get_league', 'get_tour', 'get_team', 'get_user']
