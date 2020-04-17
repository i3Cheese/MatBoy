from flask_restful import reqparse, abort, Resource, request
from flask_restful.inputs import boolean
from flask import jsonify
from data import User, Team, Tournament, League, Game, create_session
from datetime import date
from config import config
import logging


def get_date_from_string(strdate: str) -> date:
    return date.fromisoformat('-'.join(reversed(strdate.split("."))))


def get_user(session, user_id=None, email=None, do_abort=True) -> User:
    if user_id:
        user = session.query(User).get(user_id)
        if do_abort and not user:
            abort(404, message=f"User #{user_id} not found")
    elif email:
        user = session.quert(User).filter(User.email == email).first()
        if do_abort and not user:
            abort(404, message=f"User with email {email} not found")
    else:
        return None
    return user


def get_team(session, team_id, do_abort=True) -> Team:
    team = session.query(Team).get(team_id)
    if do_abort and not team:
        abort(404, message=f"Team #{team_id} not found")
    return team


def get_tour(session, tour_id, do_abort=True) -> Tournament:
    tour = session.query(Tournament).get(tour_id)
    if do_abort and not tour:
        abort(404, message=f"Tournament #{tour_id} not found")
    return tour


def get_league(session, league_id, do_abort=True) -> League:
    league = session.query(League).get(league_id)
    if do_abort and not league:
        abort(404, message=f"League #{league_id} not found")
    return league


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
    reg_pars.add_argument('surname', required=True, type=str)
    reg_pars.add_argument('name', required=True, type=str)
    reg_pars.add_argument('patronymic', required=False, type=str)
    reg_pars.add_argument('city', required=False, type=str)
    reg_pars.add_argument('birthday', required=True, type=get_date_from_string)
    reg_pars.add_argument('email', required=True, type=str)
    reg_pars.add_argument('password', required=True, type=str)

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


class TeamResource(Resource):
    put_pars = reqparse.RequestParser()
    put_pars.add_argument('name', type=str)
    put_pars.add_argument('motto', type=str)
    put_pars.add_argument('accepted', type=boolean)
    put_pars.add_argument('trainer.id', type=int)
    put_pars.add_argument('trainer.email', type=str)
    put_pars.add_argument('league.id', type=int)

    def get(self, team_id: int):
        session = create_session()
        team = get_team(session, team_id)
        return jsonify(team.to_dict(only=("id",
                                          "name",
                                          "motto",
                                          "accepted",
                                          "accepted",
                                          "trainer.id",
                                          "trainer.email",
                                          "tournament.id",
                                          "tournament.title",
                                          "league.id",
                                          "league.title"
                                          )
                                    )
                       )

    def put(self, team_id):
        """If trainer.id and trainer.email specified in the same time
           trainer was looking by trainer.id"""
        args = self.put_pars.parse_args()
        print(args)
        session = create_session()
        team = get_team(session, team_id)
        if not(args['trainer.id'] is None and args['trainer.email'] is None):
            team.trainer = get_user(session,
                            user_id=args['trainer.id'],
                            email=args['trainer.email'],
                            )
        if args['league.id'] is not None:
            team.league = get_league(session, args['league.id'])
        if args['name'] is not None:
            team.name = args['name']
        if args['motto'] is not None:
            team.name = args['motto']
        if args['accepted'] is not None:
            team.accepted = args['accepted']
        session.merge(team)
        session.commit()
        return jsonify({'success': 'ok'})

    def delete(self, team_id):
        session = create_session()
        team = get_team(session, team_id)
        session.delete(team)
        session.commit()
        return jsonify({'success': 'ok'})
