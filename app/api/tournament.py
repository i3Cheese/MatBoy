from flask_restful import reqparse, abort, Resource, request
from flask_restful.inputs import boolean
from flask import jsonify
from flask_login import current_user, login_required
from data import User, League, Game, Post, Tournament, create_session
from data.user import AnonymousUser

import logging

from .data_tools import get_user, get_game, get_post, get_team, get_tour, get_league
from .data_tools import to_dict, get_date_from_string, get_datetime_from_string, abort_if_email_exist


class TournamentResource(Resource):
    @login_required
    def delete(self, tour_id):
        session = create_session()
        tour = get_tour(session, tour_id)
        if not tour.have_permission(current_user):
            abort(403, message="Permission denied")
        session.delete(tour)
        session.commit()
        return jsonify({'success': 'ok'})


class TournamentsResource(Resource):
    get_pars = reqparse.RequestParser()
    get_pars.add_argument(
        'id', type=int, location='args', required=True)

    @classmethod
    def get(cls):
        """Return the tour you are looking for"""
        session = create_session()
        args = cls.get_pars.parse_args()

        json_resp = {}
        query = session.query(Tournament)
        tour = query.get(args['id'])
        if tour:
            json_resp['tournament'] = to_dict(tour)
        else:
            abort(404, error={'tournament': 'not_found'})

        return jsonify(json_resp)