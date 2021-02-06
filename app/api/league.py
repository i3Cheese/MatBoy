from flask_restful import reqparse, abort, Resource, request
from flask_restful.inputs import boolean
from flask import jsonify
from flask_login import current_user, login_required
from data import User, League, Game, Post, create_session
from data.user import AnonymousUser

import logging

from .data_tools import get_user, get_game, get_post, get_team, get_tour, get_league
from .data_tools import to_dict, get_date_from_string, get_datetime_from_string, abort_if_email_exist


class LeagueResource(Resource):
    put_pars = reqparse.RequestParser()
    put_pars.add_argument('title', type=str)
    put_pars.add_argument('description', type=str)
    put_pars.add_argument('chief.id', type=int)
    put_pars.add_argument('chief.email', type=str)
    put_pars.add_argument('tournament.id', type=int)
    put_pars.add_argument('send_info', type=boolean, default=False)

    def get(self, league_id: int):
        session = create_session()
        league = get_league(session, league_id)
        if league.have_permission(current_user):
            d = league.to_dict()
        else:
            d = league.to_secure_dict()
        return jsonify({'league': d})

    @login_required
    def put(self, league_id):
        """Handle request to change league."""
        args = self.put_pars.parse_args()
        logging.info(f"League put request with args {args}")

        session = create_session()
        league = get_league(session, league_id)
        if not league.have_permission(current_user):
            abort(403, message="Permission denied")

        if not (args['chief.id'] is None and args['chief.email'] is None):
            league.chief = get_user(session,
                                    user_id=args['chief.id'],
                                    email=args['chief.email'],
                                    )
        if args['tournament.id'] is not None:
            league.tournament = get_tour(session, args['tournament.id'])
        if args['title'] is not None:
            if not args['title']:
                abort(400, message="Название не может быть пустым")
            league.title = args['title']
        if args['description'] is not None:
            league.description = args['description']
        session.merge(league)
        session.commit()

        response = {"success": "ok"}
        if args['send_info']:
            response["league"] = league.to_dict()
        return jsonify(response)

    @login_required
    def delete(self, league_id):
        """Delete this league and set league.teams.status to <=1"""
        session = create_session()
        league = get_league(session, league_id, do_abort=False)
        if not league.have_permission(current_user):
            abort(403, message="Permission denied")

        if not league:
            return jsonify({'success': 'ok'})

        for team in league.teams:
            team.league_id = None
            if team.status != 0:
                team.status = 1
            session.merge(team)

        session.delete(league)
        session.commit()
        return jsonify({'success': 'ok'})


class LeaguesResource(Resource):
    post_pars = LeagueResource.put_pars.copy()
    post_pars.replace_argument(
        'title', type=str, required=True, help="Необходимо указать название")
    post_pars.replace_argument('tournament.id', type=int, required=True)

    def post(self):
        args = self.post_pars.parse_args()
        logging.info(f"League post request with args {args}")

        session = create_session()
        tour = get_tour(session, args['tournament.id'])
        if not tour.have_permission(current_user):
            abort('403', message="Permission denied")

        league = League()
        league.tournament = tour
        if args['chief.id'] is None and args['chief.email'] is None:
            abort(400, message={
                "chief": "Не указана информация о главном по лиге"})
        else:
            league.chief = get_user(session,
                                    user_id=args['chief.id'],
                                    email=args['chief.email'], )
        league.title = args['title']
        if args['description'] is not None:
            league.description = args['description']

        session.add(league)
        session.commit()

        response = {"success": "ok"}
        if args['send_info']:
            response["league"] = league.to_dict()
        return jsonify(response)
