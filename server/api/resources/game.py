import logging
import datetime

from flask import jsonify, request
from flask_login import current_user
from flask_restful import Resource, reqparse, abort
from flask_restful.inputs import boolean

from data import get_session, Game, Team, League, db_session
from data.exceptions import StatusError
from server.api import api
from server.api.resources.utils import datetime_type, get_model, get_user, get_team, ModelId, user_type, team_type, \
    league_type


@api.resource('/game/<int:game_id>')
class GameResource(Resource):
    put_pars = reqparse.RequestParser()
    put_pars.add_argument('place', type=str)
    # Empty string == None
    put_pars.add_argument(
        'start_time', type=datetime_type, help="Неверный формат даты")

    put_pars.add_argument('team1', type=team_type,
                          help="Неправильный указана команда", dest='team1')
    put_pars.add_argument('team2', type=team_type,
                          help="Неправильно указана команда", dest='team2')

    def get(self, game_id):
        game = get_model(Game, game_id)
        d = game.to_dict()
        if game.is_deleted:
            abort(404)
        return jsonify({'game': d, 'success': True})

    def delete(self, game_id):
        game = get_model(Game, game_id)
        if game is not None:
            game.delete()
            get_session().commit()
        return jsonify({'success': True})

    def put(self, game_id):
        """Handle request to change game. Can't change protocol"""
        args = self.put_pars.parse_args()
        logging.info(f"Game put request: {args}")

        session = get_session()
        game = get_model(Game, game_id)
        if not game.have_full_access(current_user):
            abort(403)

        if args['place'] is not None:
            game.place = args['place']
        if args['start_time'] is not None:
            game.start_time = args['start_time']
        if args['team1'] is not None:
            game.team1 = args['team1']
        if args['team2'] is not None:
            game.team2 = args['team2']
        if (args['team1'] or args['team2']) and game.team1 == game.team2:
            abort(400, message="Команды должны быть различны")

        session.merge(game)
        session.commit()

        response = {"success": True, "game": game.to_dict()}
        logging.info(f"Game put response: {response}")
        return jsonify(response)


@api.resource('/game/<int:game_id>/status')
class GameStatusResource(Resource):
    put_pars = reqparse.RequestParser()
    put_pars.add_argument(
        'action',
        type=str,
        required=True,
        choices=["start", "finish", "restore"],
    )

    def put(self, game_id):
        args = self.put_pars.parse_args()
        game = get_model(Game, game_id)
        action = args['action']
        if not game.have_manage_access(current_user):
            abort(403)
        try:
            if action == "start":
                game.start()
            elif action == "finish":
                game.finish()
            elif action == "restore":
                game.restore()
        except StatusError as e:
            abort(400, message=str(e))

        db_session.merge(game)
        db_session.commit()
        return {"game": game.to_dict(), "success": True}


@api.resource('/game')
class GamesResource(Resource):
    get_pars = reqparse.RequestParser()
    get_pars.add_argument('league_id', type=ModelId(League), dest='league',
                          help="Неправильно указана лига", )
    get_pars.add_argument('team_id', type=ModelId(Team), dest='team',
                          help="Неправильно указана команда", )

    def get(self):
        args = self.get_pars.parse_args()
        league = args['league']
        team = args['team']
        if league is not None:
            games = league.games
        elif team is not None:
            games = team.games
        else:
            abort(400, message='Details not provided')
            return
        print(games)
        games = filter(lambda g: not g.is_deleted, games)
        res = {
            'success': True,
            'games': [g.to_dict() for g in games]
        }
        return jsonify(res)

    post_pars = GameResource.put_pars.copy()
    post_pars.add_argument('league_id', type=ModelId(League), dest='league',
                           help="Неправильно указана лига", required=True)
    post_pars.replace_argument('team1', type=team_type,
                               required=True, help="Неправильный указана команда")
    post_pars.replace_argument('team2', type=team_type,
                               required=True, help="Неправильно указана команда")

    def post(self):
        """Handle request to new game."""
        args = self.post_pars.parse_args()

        session = get_session()
        league = args['league']
        if not league.have_permission(current_user):
            abort(403)

        team1 = args['team1']
        team2 = args['team2']
        if team1 == team2:
            abort(400, message="Команды должны быть различны")

        game = Game(
            league=league,
            place=args['place'],
            start=args['start_time'],
            team1=team1,
            team2=team2,
        )

        session.add(game)
        session.commit()

        response = {"success": "ok", "game": game.to_dict()}
        return jsonify(response)
