import logging

from flask_login import current_user, login_required
from flask_restful import Resource, reqparse, abort
from flask import jsonify
from flask_restful.inputs import boolean

from data import League, get_session, Tournament
from server.api import api
from server.api.resources.utils import get_tour, get_user, ModelId, user_type, get_model


@api.resource('/league')
class LeaguesResource(Resource):
    get_pars = reqparse.RequestParser()
    get_pars.add_argument('tournament_id', type=int)

    def get(self):
        args = self.get_pars.parse_args()
        leagues = League.query.filter_by(tournament_id=args['tournament_id']).all()
        return jsonify({'leagues': [item.to_dict() for item in leagues], 'success': True})

    post_pars = reqparse.RequestParser()
    post_pars.add_argument('title', type=str, required=True, help="Необходимо указать название")
    post_pars.add_argument('description', type=str)
    post_pars.add_argument('chief', type=user_type, required=True)
    post_pars.add_argument('tournament_id', type=ModelId(Tournament), dest='tournament', required=True)

    def post(self):
        args = self.post_pars.parse_args()
        logging.info(f"League post request with args {args}")

        session = get_session()
        tour = args['tournament']
        chief = args['chief']
        if not tour.have_permission(current_user):
            abort('403', message="Permission denied")

        league = League(
            tournament=tour,
            chief=chief,
            title=args['title'],
            description=args['description'] or None,
        )

        session.add(league)
        session.commit()

        response = {"success": True, "league": league.to_dict()}
        return jsonify(response)


@api.resource('/league/<int:league_id>')
class LeagueResource(Resource):
    put_pars = reqparse.RequestParser()
    put_pars.add_argument('title', type=str)
    put_pars.add_argument('description', type=str)
    put_pars.add_argument('chief', type=user_type, )
    put_pars.add_argument('tournament_id', type=ModelId(Tournament), dest='tournament', )

    def get(self, league_id: int):
        league = get_model(League, league_id)
        d = league.to_dict()
        return jsonify({'league': d, "success": True})

    @login_required
    def put(self, league_id):
        """Handle request to change league."""
        args = self.put_pars.parse_args()
        logging.info(f"League put request with args {args}")

        session = get_session()
        league = get_model(League, league_id)
        if not league.edit_access():
            abort(403, message="Permission denied")

        if args['chief'] is not None:
            league.chief = args['chief']
        if args['tournament'] is not None:
            league.tournament = args['tournament']
        if args['title'] is not None:
            if not args['title']:
                abort(400, message="Название не может быть пустым")
            league.title = args['title']
        if args['description'] is not None:
            league.description = args['description']
        session.merge(league)
        session.commit()

        response = {"success": True, "league": league.to_dict()}
        return jsonify(response)

    @login_required
    def delete(self, league_id):
        """Delete this league and set league.teams.status to <=1"""
        session = get_session()
        league = get_model(League, league_id, do_abort=False)
        if not league:
            return jsonify({'success': True})
        if not league.have_permission(current_user):
            abort(403, message="Permission denied")

        for team in league.teams:
            team.league_id = None
            if team.status != 0:
                team.status = 1
            session.merge(team)

        session.delete(league)
        session.commit()
        return jsonify({'success': True})
