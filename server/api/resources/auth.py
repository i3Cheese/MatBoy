from flask_restful import Resource, abort, reqparse
from flask import jsonify, request
from flask_login import login_user, logout_user, current_user

# from data import db_session
from server.api import api
from server import app
from data import User, get_session
from server.api.resources.utils import date_type, abort_if_email_exist
from server.forms import LoginForm


@api.resource('/login')
class LoginResource(Resource):
    def post(self):
        data = request.get_json()
        form = LoginForm.from_json(data['form'])
        res = {"success": False}
        if form.validate():
            user = User.query.filter(User.email == form.email.data).first()
            if not user:
                res['message'] = 'Пользователь не найден'
                res['errors'] = {'email': 'not found'}
                res["success"] = False
            elif not user.check_password(form.password.data):
                res['message'] = 'Неправильный пароль'
                res['errors'] = {'password': 'invalid'}
                res["success"] = False
            else:
                login_user(user, remember=True)
                res["success"] = True
                res["user"] = user.to_dict()
        else:
            res['success'] = False
            res['message'] = str(form.errors)
            res['errors'] = form.errors
        return jsonify(res)


@api.resource('/current_user')
class CurrentUser(Resource):
    def get(self):
        if current_user.is_authenticated:
            return jsonify({"loggedIn": True, "user": current_user.to_dict()})
        else:
            return jsonify({"loggedIn": False})


@api.resource('/logout')
class Logout(Resource):
    def post(self):
        if current_user.is_authenticated:
            logout_user()
        return jsonify({'loggedIn': False, 'message': "Вы вышли из аккаунта"})


@api.resource('/registration')
class RegistrationResource(Resource):
    reg_pars = reqparse.RequestParser()
    reg_pars.add_argument('surname', required=True, type=str)
    reg_pars.add_argument('name', required=True, type=str)
    reg_pars.add_argument('patronymic', required=False, type=str)
    reg_pars.add_argument('city', required=False, type=str)
    reg_pars.add_argument('birthday', required=True, type=date_type)
    reg_pars.add_argument('email', required=True, type=str)
    reg_pars.add_argument('password', required=True, type=str)

    @classmethod
    def post(cls):
        args = cls.reg_pars.parse_args()
        session = get_session()
        abort_if_email_exist(session, args['email'])
        user = User(email=args['email'],
                    name=args['name'],
                    surname=args['surname'],
                    patronymic=args['patronymic'],
                    city=args['city'],
                    birthday=args['birthday'],
                    password=args['password'],
                    )
        session.add(user)
        session.commit()
        return jsonify({"success": "ok", "user": user.to_dict()})
