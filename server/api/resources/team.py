import logging

from flask_login import current_user
from flask_restful import Resource, reqparse, abort
from flask import jsonify, request
from flask_restful.inputs import boolean
from wtforms import StringField, TextAreaField, FieldList, FormField, SubmitField
from wtforms.fields.html5 import EmailField
from wtforms.validators import Email, ValidationError

from data import League, get_session, Team, User, Tournament
from server.api import api
from server.api.resources import get_tour, get_user
from server.forms import BaseForm, field_data_lower, RuDataRequired, field_data_capitalizer, NullableDateField


class BasicUserForm(BaseForm):
    email = EmailField('E-mail *', validators=[field_data_lower,
                                               Email(message="Неправильный формат"),
                                               RuDataRequired()])

    def required_if_new(form, field):
        if form.__new_email:
            RuDataRequired()(form, field)

    surname = StringField('Фамилия *', validators=[field_data_capitalizer, required_if_new])
    name = StringField('Имя *', validators=[field_data_capitalizer, required_if_new])
    patronymic = StringField("Отчество (если есть)", validators=[field_data_capitalizer,])
    city = StringField("Город *", validators=[field_data_capitalizer, required_if_new])
    birthday = NullableDateField("Дата рождения *", validators=[required_if_new])

    __new_email = False

    __required_if_new = ['surname', 'name', 'city', 'birthday']

    def __init__(self, *args, meta=None, **kwargs):
        if meta is None:
            meta = {'csrf': False}
        else:
            meta['csrf'] = False
        super(BasicUserForm, self).__init__(*args, meta=meta, **kwargs)

    def validate_email(form, field):
        session = get_session()
        user = session.query(User).filter_by(email=field.data.lower()).first()
        form.__new_email = user is None


class TeamForm(BaseForm):
    """Form for team request"""
    name = StringField("Название команды *", validators=[RuDataRequired()])
    motto = TextAreaField("Девиз команды")
    players = FieldList(FormField(BasicUserForm),
                        "Данные участников",
                        min_entries=4,
                        max_entries=8, )
    submit = SubmitField("Отправить")

    @staticmethod
    def validate_players(field):
        emails = set()
        success = True
        for user_form in field.entries:
            email = user_form.email.data.lower()
            if email in emails:
                user_form.email.errors.append("Участник указан несколько раз")
                success = False
            else:
                emails.add(email)
        if not success:
            raise ValidationError("Один из участников указан несколько раз")

def process_team_players(entries, team):
    emails = []
    for user_form in entries:  # Check players
        email = user_form.email.data.lower()
        emails.append(email)
        user = User.query.filter(User.email == email).first()
        if not user:
            user = User()
            for field in user_form:
                if field.data:
                    setattr(user, field.short_name, field.data)
        team.players.append(user)
    return emails


@api.resource('/team')
class TeamsResource(Resource):
    get_pars = reqparse.RequestParser()
    get_pars.add_argument('tournament_id', type=int)

    def get(self):
        args = self.get_pars.parse_args()
        teams = Team.query.filter_by(tournament_id=args['tournament_id']).all()
        return jsonify({'teams': [item.to_dict() for item in teams], 'success': True})

    def post(self):
        data = request.get_json()
        tour_id = data['tournament_id']
        form = TeamForm.from_json(data['form'])

        session = get_session()
        tour = Tournament.query.get(tour_id)
        if not tour:
            abort(404)

        emails = []
        res = {'success': False}
        if form.validate():  # Validate posted data
            team = Team().fill(
                name=form.name.data,
                motto=form.motto.data,
                trainer_id=current_user.id,
                tournament_id=tour.id,
            )
            emails = process_team_players(form.players.entries, team)
            session.add(team)
            session.commit()
            res['success'] = True
            res['team'] = team.to_dict()
        return jsonify(res)
