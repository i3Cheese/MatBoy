from flask_restful import Resource, abort
from flask import jsonify
from flask_login import login_required, current_user

from data import get_session, Tournament
from server.api.resources.utils import get_tour
from server.api import api


class TournamentsResource(Resource):
    def get(self):
        tours = Tournament.query.all()
        return jsonify({'tours': [t.to_dict() for t in tours], 'success': True})


api.add_resource('/tournament')


class TournamentResource(Resource):
    @login_required
    def delete(self, tour_id):
        session = get_session()
        tour = get_tour(session, tour_id, do_abort=False)
        if tour is not None:
            if not tour.have_permission(current_user):
                abort(403, message="Permission denied")
            session.delete(tour)
            session.commit()
        return jsonify({'success': True})


api.add_resource('/tournament/<int:tour_id>')