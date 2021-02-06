from flask_restful import reqparse, abort, Resource, request
from flask_restful.inputs import boolean
from flask import jsonify
from flask_login import current_user, login_required
from data import User, League, Game, Post, Team, create_session
from data.user import AnonymousUser

import logging
from typing import List, Optional

from .data_tools import get_user, get_game, get_post, get_team, get_tour, get_league
from .data_tools import to_dict, get_date_from_string, get_datetime_from_string, abort_if_email_exist


class TeamsResource(Resource):
    post_pars = reqparse.RequestParser()
    post_pars.add_argument('name', type=str, required=True)
    post_pars.add_argument('motto', type=str, required=False)
    post_pars.add_argument('emails', type=list, required=True, location='json')
    post_pars.add_argument('tour_id', type=int, required=True)

    @classmethod
    @login_required
    def post(cls):
        args = cls.post_pars.parse_args()
        session = create_session()
        team = Team(name=args['team'],
                    motto=args['motto'] or None
                    )
        team.trainer = current_user
        for email in args['email']:
            user = session.query(User).filter_by(email=email).first()
            if not user:
                abort(400, error={'emails': {email: 'not_found'}}, message=f'{email} не зарегистрирован')
            team.players.append(user)
        session.add(team)
        session.commit()
        return {'success': 'ok', 'team': team.to_dict()}

    get_pars = reqparse.RequestParser()
    get_pars.add_argument(
        'id', type=int, location='args', dest='team_id')
    get_pars.add_argument(
        'tour_id', type=int, location='args')

    @classmethod
    def get(cls):
        """Return the team you are looking for"""
        session = create_session()
        args = cls.get_pars.parse_args()
        
        json_resp = {}
        query = session.query(Team)
        if args['tour_id']:
            query = query.filter_by(tour_id=args['tour_id'])

        if args['team_id']:
            team: Team = query.get(args['team_id'])
            if team:
                json_resp['team'] = to_dict(team)
            else:
                abort(404, error={'team': 'not_found'}, message="Команда не найдена")

        teams: List[Team] = query.all()
        json_resp['teams'] = [to_dict(t) for t in teams]

        return jsonify(json_resp)


class TeamResource(Resource):
    @classmethod
    def get(cls, team_id: int):
        session = create_session()
        team = get_team(session, team_id)
        return jsonify(to_dict(team))

    put_pars = reqparse.RequestParser()
    put_pars.add_argument('action', type=str, choices=['change', 'reject', 'submit', 'return', ''])
    put_pars.add_argument('name', type=str)
    put_pars.add_argument('motto', type=str)
    put_pars.add_argument('emails', type=list, required=True, location='json')
    put_pars.add_argument('league.id', type=int)

    @login_required
    def put(self, team_id):
        """
        If trainer.id and trainer.email specified in the same time
        trainer was looking by trainer.id.
        """
        args = self.put_pars.parse_args()
        logging.info(f"Team put request with args {args}")

        session = create_session()
        team = get_team(session, team_id)
        perm = False
        if team.tournament.have_permission(current_user):
            perm = True
        elif team.status == 'frozen' and team.trainer == current_user:
            perm = True
        elif team.status == 'ready' and team.league.have_permission(current_user):
            perm = True
        else:
            abort(403, message="У вас не разрешения на изменение этой команды.")

        for email in args['email']:
            user = session.query(User).filter_by(email=email).first()
            if not user:
                abort(400, message=f'{email} не зарегестрирован', error={'emails': {email: 'not_found'}})
            team.players.append(user)
        session.add(team)
        session.commit()
        return {'success': 'ok', 'team': team.to_dict()}

    @login_required
    def delete(self, team_id):
        """Sets the status of team to zero. Thats mean that the team request was refused"""
        session = create_session()
        team = get_team(session, team_id)
        if not team.have_permission(current_user):
            abort(403, message="Permission denied")
        team.status = 0
        session.merge(team)
        session.commit()
        return jsonify({'success': 'ok'})
