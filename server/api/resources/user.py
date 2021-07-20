from flask import jsonify
from flask_login import current_user
from flask_restful import Resource, reqparse, abort

from data import get_session, User
from server.api.resources.utils import get_user, abort_if_email_exist, date_type, lower
from server.api import api


@api.resource('/user/<int:user_id>')
class UserResource(Resource):
    put_pars = reqparse.RequestParser()
    put_pars.add_argument('vk_id', type=int, help="wrong type")

    def get(self, user_id: int):
        session = get_session()
        user = get_user(session, user_id)
        d = user.to_dict()
        return jsonify({"user": d})

    def put(self, user_id: int):
        args = self.put_pars.parse_args()
        session = get_session()
        user = get_user(session, user_id)
        if current_user != user and not current_user.is_admin:
            abort(403)
        if args['vk_id'] is not None:  # integrate user with vk
            user.vk_id = args['vk_id']
            user.integration_with_VK = True
        session.commit()
        return jsonify({"success": "ok"})


@api.resource('/user')
class UsersResource(Resource):
    reg_pars = reqparse.RequestParser()
    reg_pars.add_argument('surname', required=True, type=str)
    reg_pars.add_argument('name', required=True, type=str)
    reg_pars.add_argument('patronymic', required=False, type=str)
    reg_pars.add_argument('city', required=False, type=str)
    reg_pars.add_argument('birthday', required=True, type=date_type)
    reg_pars.add_argument('email', required=True, type=str)
    reg_pars.add_argument('password', required=True, type=str)

    get_pars = reqparse.RequestParser()
    get_pars.add_argument(
        'vk_id', type=int, help="wrong type", location='args')
    get_pars.add_argument(
        'email', type=lower, location='args')

    @classmethod
    def post(cls):
        """Add new user to db"""
        args = UsersResource.reg_pars.parse_args()
        session = get_session()
        abort_if_email_exist(session, args['email'])
        user = User().fill(email=args['email'],
                           name=args['name'],
                           surname=args['surname'],
                           patronymic=args['patronymic'],
                           city=args['city'],
                           birthday=args['birthday'],
                           )
        user.set_password(args['password'])
        session.add(user)
        session.commit()
        return jsonify({"success": "ok", "user": user.to_dict()})

    @classmethod
    def get(cls):
        """Return the user you are looking for"""
        args = cls.get_pars.parse_args()

        query = User.query
        if args['vk_id']:
            query = query.filter_by(vk_id=args['vk_id'])
        if args['email']:
            query = query.filter_by(email=args['email'].lower())
        user = query.first()
        json_resp = {'exist': user is not None}
        if user:
            json_resp['user'] = user.to_dict()
        return jsonify(json_resp)