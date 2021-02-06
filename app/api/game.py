from flask_restful import reqparse, abort, Resource, request
from flask_restful.inputs import boolean
from flask import jsonify
from flask_login import current_user, login_required
from data import User, League, Game, Post, create_session
from data.user import AnonymousUser

import logging

from .data_tools import get_user, get_game, get_post, get_team, get_tour, get_league
from .data_tools import to_dict, get_date_from_string, get_datetime_from_string, abort_if_email_exist


class GameResource(Resource):
    put_pars = reqparse.RequestParser()
    put_pars.add_argument('place', type=str)
    # Empty string == None
    put_pars.add_argument(
        'start', type=get_datetime_from_string, help="Неверный формат даты")
    put_pars.add_argument('status', type=int)
    put_pars.add_argument('judge.id', type=int)
    put_pars.add_argument('judge.email', type=str)
    put_pars.add_argument('league.id', type=int,
                          help="Неправильно указана лига")
    put_pars.add_argument('team1.id', type=int,
                          help="Неправильный указана команда")
    put_pars.add_argument('team2.id', type=int,
                          help="Неправильно указана команда")
    put_pars.add_argument('send_info', type=boolean, default=False)

    def get(self, game_id):
        session = create_session()
        game = get_game(session, game_id)
        if game.have_permission(current_user):
            d = game.to_dict()
        else:
            d = game.to_short_dict()
        return jsonify({'game': d})

    def put(self, game_id):
        """Handle request to change game. Can't change protocol"""
        args = self.put_pars.parse_args()
        logging.info(f"Game put request: {args}")

        session = create_session()
        game = get_game(session, game_id)
        if not game.have_permission(current_user):
            abort(403)

        if args['place'] is not None:
            game.place = args['place']
        if args['start'] is not None:
            game.start = args['start']
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

        if not (args['judge.id'] is None and args['judge.email'] is None):
            game.judge = get_user(session,
                                  user_id=args['judge.id'],
                                  email=args['judge.email'], )

        if not (args['team1.id'] is None and args['team2.id'] is None):
            if args['team1.id'] is not None:
                game.team1 = get_team(session, args['team1.id'])
            if args['team2.id'] is not None:
                game.team2 = get_team(session, args['team2.id'])
            if game.team1 == game.team2:
                abort(400, message="Команды должны быть различны")
        if args['league.id'] is not None:
            game.league = get_league(session, args['league.id'])

        session.merge(game)
        session.commit()

        response = {"success": "ok"}
        if args['send_info']:
            response["game"] = game.to_dict()
        logging.info(f"Game put response: {response}")
        return jsonify(response)

    def delete(self, game_id):
        """Sets the status of game to zero. Thats mean that the game is canceled"""
        session = create_session()
        game = get_game(session, game_id)
        if not game.have_permission(current_user):
            abort(403)
        game.status = 0
        session.merge(game)
        session.commit()
        return jsonify({"success": "ok"})


class GamesResource(Resource):
    post_pars = GameResource.put_pars.copy()
    post_pars.replace_argument('league.id', type=int, required=True)
    post_pars.replace_argument('team1.id', type=int,
                               required=True, help="Неправильный указана команда")
    post_pars.replace_argument('team2.id', type=int,
                               required=True, help="Неправильно указана команда")

    def post(self):
        """Handle request to new game."""
        args = self.post_pars.parse_args()
        logging.info(f"Game post request: {args}")

        session = create_session()
        league = get_league(session, args['league.id'])
        if not league.have_permission(current_user):
            abort(403)

        game = Game()
        game.league = league
        if args['place'] is not None:
            game.place = args['place']
        if args['start'] is not None:
            game.start = args['start']
        if not (args['judge.id'] is None and args['judge.email'] is None):
            game.judge = get_user(session,
                                  user_id=args['judge.id'],
                                  email=args['judge.email'], )
        else:
            abort(400, message="Не указана информация о судье")
        game.team1 = get_team(session, args['team1.id'])
        game.team2 = get_team(session, args['team2.id'])
        if game.team1 == game.team2:
            abort(400, message="Команды должны быть различны")

        session.add(game)
        session.commit()

        response = {"success": "ok"}
        if args['send_info']:
            response["game"] = game.to_dict()
        logging.info("Game post response: " + str(response))
        return jsonify(response)


class ProtocolResource(Resource):
    def put(self, game_id):
        """Gets parts of protocol and complements it"""
        session = create_session()
        game = get_game(session, game_id)
        logging.info("Protocol put with json " + str(request.json))
        if not game.have_permission(current_user):
            abort(403)

        if 'teams' in request.json:
            game.protocol['teams'] = request.json['teams']
        if 'captain_task' in request.json:
            game.protocol['captain_task'] = request.json['captain_task']
        if 'captain_winner' in request.json:
            try:
                game.captain_winner = int(request.json['captain_winner'])
            except ValueError as e:
                abort(400, error={'captain_winner': str(e)})

        if 'rounds' in request.json:
            rounds = request.json['rounds']
            teams_points = [0, 0]
            teams_stars = [0, 0]
            for round in rounds:
                for i, team in enumerate(round['teams']):
                    team['points'] = int(team.get('points', 0))
                    team['stars'] = int(team.get('stars', 0))
                    teams_points[i] += team['points']
                    teams_stars[i] += team['stars']
                    if 'player' in team:
                        player = None
                        if isinstance(team['player'], int):
                            player = get_user(
                                session, team['player'], do_abort=False)
                        elif isinstance(team['player'], dict):
                            player = get_user(session, team['player'].get(
                                'id', 0), do_abort=False)
                        if player:
                            team['player'] = player.to_short_dict()
                        else:
                            team['player'] = AnonymousUser().to_short_dict()
            game.protocol['rounds'] = rounds
            game.protocol['points'] = teams_points + \
                [len(rounds) * 12 - sum(teams_points), ]  # Count judge points
            game.protocol['stars'] = teams_stars

        session.merge(game)
        session.commit()
        return jsonify({"success": "ok"})

    def get(self, game_id):
        session = create_session()
        game = get_game(session, game_id)
        return jsonify(game.protocol)
