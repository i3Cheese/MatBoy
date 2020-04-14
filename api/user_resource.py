from flask_restful import reqparse, abort, Resource
from flask import jsonify
from data import User, create_session
from datetime import date
from config import config


def get_date_from_string(strdate: str) -> date:
    return date.fromisoformat('-'.join(reversed(strdate.split("."))))


def get_user(session, user_id, do_abort=True) -> User:
    user = session.query(User).get(user_id)
    if do_abort and not user:
        abort(404, message=f"User #{user_id} not found")
    return user


def abort_if_email_exist(session, email):
    if session.query(User).filter(User.email == email).first():
        abort(409, message=f"User wiht email {repr(email)} alredy exist")


class UserResource(Resource):
    def get(self, user_id: int):
        session = create_session()
        return jsonify({"user": get_user(session, user_id).to_dict(only=(
            "id",
            "name",
            "surname",
            "patronymic",
            "city",
            "birthday",
            "email",
            "is_creator",
        ))})

    def delete(self, user_id):
        """Only admin can delete"""
        # TODO: UserResource delete
        pass


class UsersResource(Resource):
    reg_pars = reqparse.RequestParser()
    reg_pars.add_argument('surname', required=True)
    reg_pars.add_argument('name', required=True)
    reg_pars.add_argument('patronymic', required=False)
    reg_pars.add_argument('city', required=False)
    reg_pars.add_argument('birthday', required=True, type=get_date_from_string)
    reg_pars.add_argument('email', required=True)
    reg_pars.add_argument('password', required=True)

    def post(self):
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
        user.set_password(args['password'])
        session.add(user)
        session.commit()
        return jsonify({"success": "ok"})

    def get(self):
        session = create_session()
        users = session.query(User).all()
        json_resp = {"users": [user.to_dict(only=(
            "id",
            "name",
            "surname",
            "email",
        )) for user in users]}
        return jsonify(json_resp)
