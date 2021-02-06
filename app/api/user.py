from flask_restful import reqparse, abort, Resource, request
from flask_restful.inputs import boolean, date
from flask import jsonify
from flask_login import current_user, login_required
from data import User, League, Game, Post, create_session
from data.user import AnonymousUser

import logging

from .data_tools import get_user, get_game, get_post, get_team, get_tour, get_league
from .data_tools import to_dict, get_date_from_string, get_datetime_from_string, abort_if_email_exist


class UserResource(Resource):
    put_pars = reqparse.RequestParser()
    put_pars.add_argument('vk_id', type=int, help="wrong type")

    def get(self, user_id: int):
        session = create_session()
        user = get_user(session, user_id)
        d = to_dict(user)
        return jsonify({"user": d})

    def put(self, user_id: int):
        args = self.put_pars.parse_args()
        session = create_session()
        user = get_user(session, user_id)
        if current_user != user and not current_user.is_admin:
            abort(403)
        if args['vk_id'] is not None:  # integrate user with vk
            user.vk_id = args['vk_id']
            user.integration_with_VK = True
        session.commit()
        return jsonify({"success": "ok"})


class UsersResource(Resource):
    reg_pars = reqparse.RequestParser()
    reg_pars.add_argument('surname', required=True, type=str)
    reg_pars.add_argument('name', required=True, type=str)
    reg_pars.add_argument('patronymic', required=False, type=str)
    reg_pars.add_argument('city', required=False, type=str)
    reg_pars.add_argument('birthday', required=True, type=date)
    reg_pars.add_argument('email', required=True, type=str)
    reg_pars.add_argument('password', required=False, type=str)

    @classmethod
    def post(cls):
        """Add new user to db"""
        args = UsersResource.reg_pars.parse_args()
        session = create_session()
        abort_if_email_exist(session, args['email'])
        user = User().fill(email=args['email'],
                           name=args['name'],
                           surname=args['surname'],
                           patronymic=args['patronymic'],
                           city=args['city'],
                           birthday=args['birthday'],
                           )
        if args['password']:
            user.set_password(args['password'])
        session.add(user)
        session.commit()
        return jsonify({"success": "ok", 'user': user.to_dict()})

    get_pars = reqparse.RequestParser()
    get_pars.add_argument(
        'vk_id', type=int, help="wrong type", location='args')
    get_pars.add_argument(
        'email', location='args')
    get_pars.add_argument('check', type=boolean, required=False, default=False)

    @classmethod
    def get(cls):
        """Return the user you are looking for If unique args passed else all users"""
        session = create_session()
        args = cls.get_pars.parse_args()
        logging.log(logging.DEBUG, f'Users get with args {args}')
        if args['vk_id'] or args['email']:
            query = session.query(User)
            if args['vk_id']:
                query = query.filter_by(vk_id=args['vk_id'])
            if args['email']:
                query = query.filter_by(email=args['email'].lower())
            user = query.first()
            json_resp = {'exist': user is not None}
            if user:
                json_resp['user'] = to_dict(user)
            elif not args['check']:
                abort(404, error={'user': 'not_found'})
        else:
            users = session.query(User).all()
            json_resp = {"users": [user.to_dict(only=("id",
                                                      "name",
                                                      "surname",
                                                      "fullname",)) for user in users]}
        logging.log(logging.DEBUG, f'Users get response {json_resp}')
        return jsonify(json_resp)
