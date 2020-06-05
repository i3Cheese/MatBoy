from flask import Blueprint, redirect, abort
from data import User, Tournament, League, Team, Game, create_session
from config import config
import logging

blueprint = Blueprint('single_pages',
                      __name__,
                      template_folder=config.TEMPLATES_FOLDER,
                      static_folder=config.STATIC_FOLDER,
                      )


@blueprint.route("/league/<int:league_id>")
def league_page(league_id, tour_id=None):
    session = create_session()
    league = session.query(League).get(league_id)
    if not league:
        abort(404)
    return redirect(league.link)


@blueprint.route("/team/<int:team_id>")
def team_page(team_id, tour_id=None):
    session = create_session()
    team = session.query(Team).get(team_id)
    if not team:
        abort(404)
    return redirect(team.link)


@blueprint.route("/game/<int:game_id>")
def game_page(game_id, tour_id=None, league_id=None):
    session = create_session()
    game = session.query(Game).get(game_id)
    if not game:
        abort(404)
    return redirect(game.link)


@blueprint.route("/team_request/<int:tour_id>", methods=["GET", "POST"])
def team_request(tour_id: int):
    session = create_session()
    tour = session.query(Tournament).get(tour_id)
    if not tour:
        abort(404)
    return redirect(tour.link + '/team_request')


@blueprint.route("/edit_tournament/<int:tour_id>")
def tournament_edit_page(tour_id: int):
    return redirect('/tournament/{0}/edit'.format(tour_id))


@blueprint.route("/tournament_console/<int:tour_id>")
def tournament_console(tour_id: int):
    return redirect('/tournament/{0}/console'.format(tour_id))


@blueprint.route("/league_console/<int:league_id>")
def league_console(league_id: int):
    """Web page for manage league"""
    session = create_session()
    league = session.query(League).get(league_id)
    if not league:
        abort(404)

    return redirect(league.link + '/console')


@blueprint.route("/prepare_to_game/<int:game_id>", methods=["GET", "POST"])
def prepare_to_game(game_id):
    session = create_session()
    game = session.query(Game).get(game_id)
    if not game:
        abort(404)

    return redirect(game.link + '/prepare')


@blueprint.route("/game_console/<int:game_id>")
def game_console(game_id):
    session = create_session()
    game = session.query(Game).get(game_id)
    if not game:
        abort(404)
    return redirect(game.link + '/console')
