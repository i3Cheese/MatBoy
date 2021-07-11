from flask_restful import Resource, abort, reqparse
from flask import jsonify, request
from flask_login import login_user, logout_user, current_user

# from data import db_session
from server.api import api
from server import app
from data import User
from server.forms import LoginForm


class LoginResource(Resource):
    def post(self):
        data = request.get_json()
        form = LoginForm.from_json(data['form'])
        res = {"success": False}
        if form.validate():
            user = User.query.filter(User.email == form.email.data).first()
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
        else:
            res['success'] = False
            res['message'] = str(form.errors)
        print(res)
        return jsonify(res)


api.add_resource(LoginResource, '/login')


class CurrentUser(Resource):
    def get(self):
        if current_user.is_authenticated:
            return jsonify({"loggedIn": True, "user": current_user.to_dict()})
        else:
            return jsonify({"loggedIn": False})


api.add_resource(CurrentUser, '/current_user')


class Logout(Resource):
    def post(self):
        if current_user.is_authenticated:
            logout_user()
        return jsonify({'loggedIn': False, 'message': "Вы вышли из аккаунта"})


api.add_resource(Logout, '/logout')
