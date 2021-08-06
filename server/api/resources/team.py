import logging

from flask_login import current_user, login_required
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
    get_pars.add_argument('league_id', type=int)

    def get(self):
        args = self.get_pars.parse_args()
        league_id = args['league_id']
        tournament_id = args['tournament_id']
        query = Team.query
        if league_id is not None:
            query = query.filter_by(league_id=league_id)
        if tournament_id is not None:
            query = query.filter_by(tournament_id=tournament_id)
        teams = query.all()
        print([t.status_string for t in teams])
        return jsonify({'teams': [item.to_dict() for item in teams], 'success': True})

    post_pars = reqparse.RequestParser()
    post_pars.add_argument('tournament_id', type=ModelId(Tournament), dest='tournament')
    post_pars.add_argument('name', type=str, required=True, trim=True)
    post_pars.add_argument('motto', type=str, trim=True)
    post_pars.add_argument('players.email', type=lower)
    post_pars.add_argument('players', type=user_type, action='append', location='json')

    def post(self):
        print(request.get_json())
        args = self.post_pars.parse_args()
        print(args)
        session = get_session()
        tour = args['tournament']
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

    put_pars = reqparse.RequestParser()
    put_pars.add_argument('name', type=str)
    put_pars.add_argument('motto', type=str)
    put_pars.add_argument('status', type=int)
    put_pars.add_argument('status_string', type=str)
    put_pars.add_argument('league_id', type=ModelId(League), dest='league')  # 0 == None

    @login_required
    def put(self, team_id):
        """
        If trainer.id and trainer.email specified in the same time
        trainer was looking by trainer.id.
        """
        args = self.put_pars.parse_args()
        logging.info(f"Team put request with args {args}")

        session = get_session()
        team = get_team(session, team_id)
        print(args['status_string'])
        if not (args['league'] is None and args['status'] is None and args['status_string'] is None):
            # Change league and status can only tour chief
            if not team.tournament.have_permission(current_user):
                abort(403, message="You haven't access to tournament")
            if args['league'] is not None:
                team.league = args['league']
            if args['status'] is not None:
                team.status = args['status']
            if args['status_string'] is not None:
                team.status_string = args['status_string']
            if team.status >= 2 and team.league is None:
                abort(400, message="Принятая команда должна быть привязана к лиге")

        if not (args['name'] is None and args['motto'] is None):
            if not team.have_permission(current_user):
                abort(403, message="You haven't access to team")
            if args['name'] is not None:
                if not args['name']:
                    abort(400, message="Название не может быть пустым")
                team.name = args['name']
            if args['motto'] is not None:
                team.motto = args['motto']
        session.merge(team)
        session.commit()

        response = {'success': True, 'team': team.to_dict()}
        return response
