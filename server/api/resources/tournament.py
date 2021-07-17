from flask_restful import Resource, abort
from flask import jsonify, request
from flask_login import login_required, current_user
from wtforms import StringField, TextAreaField, SubmitField

from data import get_session, Tournament
from server.api.resources.utils import get_tour
from server.api import api
from server.forms import BaseForm, RuDataRequired, RuDateField


class TournamentInfoForm(BaseForm):
    title = StringField("Название", validators=[RuDataRequired()])
    description = TextAreaField("Дополнительная информация", )
    place = StringField("Место проведения", validators=[RuDataRequired()])
    start = RuDateField("Начало турнира", validators=[RuDataRequired()])
    end = RuDateField("Конец турнира", validators=[RuDataRequired()])
    submit = SubmitField("Подтвердить")


@api.resource('/tournament')
class TournamentsResource(Resource):
    def get(self):
        tours = Tournament.query.all()
        return jsonify({'tournaments': [t.to_dict() for t in tours], 'success': True})

    def post(self):
        data = request.get_json()
        form = TournamentInfoForm.from_json(data['form'])
        res = {"success": False}
        if form.validate():
            # Validate posted data. Create tour
            session = get_session()
            tournament = Tournament().fill(title=form.title.data,
                                           description=form.description.data,
                                           place=form.place.data,
                                           start=form.start.data,
                                           end=form.end.data,
                                           chief_id=current_user.id, )
            session.add(tournament)
            session.commit()
            res['success'] = True
            res['tournament'] = tournament.to_dict()
        else:
            res['success'] = False
            res['message'] = str(form.errors)
            abort(400, **res)
        return jsonify(res)


@api.resource('/tournament/<int:tour_id>')
class TournamentResource(Resource):
    def get(self, tour_id):
        tour = Tournament.query.get(tour_id)
        data = {'tournament': tour.to_dict(), 'success': True}
        return jsonify(data)

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

    @login_required
    def put(self, tour_id):
        session = get_session()
        tour = get_tour(session, tour_id)
        if not tour:
            abort(404)
        if not tour.have_permission(current_user):
            abort(403)
        data = request.get_json()
        form = TournamentInfoForm.from_json(data['form'])
        res = {"success": False}
        if form.validate():
            # Change tour values
            tour.title = form.title.data
            tour.description = form.description.data
            tour.place = form.place.data
            tour.start = form.start.data
            tour.end = form.end.data
            session.merge(tour)
            session.commit()
            res['success'] = True
            res['tournament'] = tour.to_dict()
        else:
            res['success'] = False
            res['message'] = str(form.errors)
            abort(400, **res)
        return jsonify(res)