from flask_restful import Resource, abort
from flask import jsonify
from flask_login import login_user, logout_user, current_user

# from data import db_session
from app.api import api
from data import User
from app.forms import LoginForm


class LoginResource(Resource):
    def get(self):
        form = LoginForm()
        return jsonify({'csrf_token': form.csrf_token._value()})

    def post(self):
        form = LoginForm()

        user = User.query.filter(User.email == form.email.data).first()
        res = {"success": False}
        if not user:
            res['message'] = 'Пользователь не найден'
            res["success"] = False
        elif not user.check_password(form.password.data):
            res['message'] = 'Неправильный пароль'
            res["success"] = False
        else:
            login_user(user, remember=True)
            res["success"] = True
            res["user"] = user.to_dict()
        return jsonify(res)


api.add_resource(LoginResource, '/api/login')


class CurrentUser(Resource):
    def get(self):
        if current_user.is_authenticated:
            return jsonify({"loggedIn": True, "user": current_user.to_dict()})
        else:
            return jsonify({"loggedIn": False})


api.add_resource(CurrentUser, '/api/logout')


class Logout(Resource):
    def post(self):
        if current_user.is_authenticated:
            logout_user()
        return jsonify({'loggedIn': False, 'message': "Вы вышли из аккаунта"})


api.add_resource(Logout, '/api/logout')
