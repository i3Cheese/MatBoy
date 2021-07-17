import logging

from flask_login import current_user
from flask_restful import Resource, reqparse, abort
from flask import jsonify
from flask_restful.inputs import boolean

from data import League, get_session
from server.api import api
from server.api.resources import get_tour, get_user


@api.resource('/league')
class LeaguesResource(Resource):
    get_pars = reqparse.RequestParser()
    get_pars.add_argument('tournament_id', type=int)

    def get(self):
        args = self.get_pars.parse_args()
        leagues = League.query.filter_by(tournament_id=args['tournament_id']).all()
        return jsonify({'leagues': [item.to_dict() for item in leagues], 'success': True})

    post_pars = reqparse.RequestParser()
    post_pars.add_argument('title', type=str)
    post_pars.add_argument('description', type=str)
    post_pars.add_argument('chief.id', type=int)
    post_pars.add_argument('chief.email', type=str)
    post_pars.add_argument('tournament.id', type=int)
    post_pars.add_argument('send_info', type=boolean, default=False)
    post_pars.replace_argument(
        'title', type=str, required=True, help="Необходимо указать название")
    post_pars.replace_argument('tournament.id', type=int, required=True)

    def post(self):
        args = self.post_pars.parse_args()
        logging.info(f"League post request with args {args}")

        session = get_session()
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
