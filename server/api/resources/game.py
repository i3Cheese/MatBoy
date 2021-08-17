import logging
import datetime

from flask import jsonify, request
from flask_login import current_user
from flask_restful import Resource, reqparse, abort
from flask_restful.inputs import boolean

from data import get_session, Game, Team, League
from server.api import api
from server.api.resources.utils import datetime_type, get_model, get_user, get_team, ModelId, user_type, team_type, \
    league_type


@api.resource('/game/<int:game_id>')
class GameResource(Resource):
    put_pars = reqparse.RequestParser()
    put_pars.add_argument('place', type=str)
    # Empty string == None
    put_pars.add_argument(
        'start', type=datetime_type, help="Неверный формат даты")
    put_pars.add_argument('status', type=int)
    put_pars.add_argument('judge', type=user_type, )

    put_pars.add_argument('team1', type=team_type,
                          help="Неправильный указана команда", dest='team1')
    put_pars.add_argument('team2', type=team_type,
                          help="Неправильно указана команда", dest='team2')
    put_pars.add_argument('send_info', type=boolean, default=False)

    def get(self, game_id):
        game = get_model(Game, game_id)
        d = game.to_dict()
        return jsonify({'game': d})

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
        if not game.have_permission(current_user):
            abort(403)

        if args['status'] is not None:
            s = args['status']
            if s == 3:
                game.finish()
            elif s == 2:
                game.start_game()
            elif s == 1:
                game.restore()
            elif s == 0:
                game.delete()
            else:
                abort(400, message="Wrong status value")

        if args['place'] is not None:
            game.place = args['place']
        if args['start'] is not None:
            game.start = args['start']
        if args['judge'] is not None:
            game.judge = args['judge']
        if args['team1'] is not None:
            game.team1 = args['team1']
        if args['team2'] is not None:
            game.team2 = args['team2']
        if game.team1 == game.team2:
            abort(400, message="Команды должны быть различны")

        session.merge(game)
        session.commit()

        response = {"success": "ok", "game": game.to_dict()}
        logging.info(f"Game put response: {response}")
        return jsonify(response)


@api.resource('/game')
class GamesResource(Resource):
    get_pars = reqparse.RequestParser()
    get_pars.add_argument('league_id', type=ModelId(League), dest='league',
                          help="Неправильно указана лига",)
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

        game = Game()
        game.league = league
        if args['place'] is not None:
            game.place = args['place']
        if args['start'] is not None:
            game.start = args['start']
        if args['judge'] is not None:
            game.judge = args['judge']
        else:
            abort(400, message="Не указана информация о судье")

        game.team1 = args['team1']
        game.team2 = args['team2']
        if game.team1 == game.team2:
            abort(400, message="Команды должны быть различны")

        session.add(game)
        session.commit()

        response = {"success": "ok", "game": game.to_dict()}
        return jsonify(response)
