import logging

from flask_login import current_user
from flask_restful import Resource, reqparse, abort
from flask import jsonify, request
from data import League, get_session, Team, User, Tournament
from server.api import api
from server.api.resources.utils import get_team, ModelId, user_type, lower, get_model


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

    post_pars = reqparse.RequestParser()
    post_pars.add_argument('tournament_id', type=ModelId(Tournament))
    post_pars.add_argument('name', type=str, required=True, trim=True)
    post_pars.add_argument('motto', type=str, trim=True)
    post_pars.add_argument('players.email', type=lower)
    post_pars.add_argument('players', type=user_type, action='append', location='json')

    def post(self):
        print(request.get_json())
        args = self.post_pars.parse_args()
        print(args)
        session = get_session()
        tour = args['tournament_id']
        if not tour:
            abort(404)
        res = {'success': False}
        team = Team().fill(
            name=args['name'],
            motto=args.get('motto', None) or None,
            trainer_id=current_user.id,
            tournament_id=tour.id,
        )
        users = args['players']
        team.players.extend(users)
        session.add(team)
        session.commit()
        res['success'] = True
        res['team'] = team.to_dict()
        return jsonify(res)


@api.resource('/team/<int:team_id>')
class TeamResource(Resource):
    def get(self, team_id):
        team = get_model(Team, team_id)
        data = {'team': team.to_dict(), 'success': True}
        return jsonify(data)
