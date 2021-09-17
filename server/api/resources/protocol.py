import typing as t

from flask import jsonify, request
from flask_login import current_user
from flask_restful import Resource, abort

from data import db_session, Game, Protocol, Team, TeamProtocolData, User, Round, TeamRoundData
from server.api import api
from server.api.resources.utils import *


def parse_team(data, nullable=False) -> t.Optional[Team]:
    if nullable and data is None:
        return None
    return get_model(Team, data['id'])


def parse_user(data, nullable=False) -> t.Optional[User]:
    if nullable and data is None:
        return None
    return get_model(User, data['id'])


def parse_team_protocol_data(data) -> TeamProtocolData:
    return TeamProtocolData(
        captain=parse_user(data['captain']),
        deputy=parse_user(data['deputy'])
    )


def parse_round(data, order: int) -> Round:
    return Round(
        order=order,
        problem=data['problem'],
        call_type=data['call_type'],
        additional=data.get('additional', ''),
        team1_data=parse_team_round_data(data['team1_data']),
        team2_data=parse_team_round_data(data['team2_data']),
    )


def parse_team_round_data(data) -> TeamRoundData:
    return TeamRoundData(
        points=data['points'],
        stars=data['stars'],
        players=list(map(parse_user, data['players']))
    )


@api.resource('/game/<int:game_id>/protocol')
class ProtocolResource(Resource):
    def put(self, game_id):
        """Gets parts of protocol and complements it"""
        game: Game = get_model(Game, game_id)
        protocol: Protocol = game.protocol

        if not protocol.have_manage_access(current_user):
            abort(403)

        data = request.json
        try:
            protocol.captain_task = data['captain_task']
            protocol.captain_winner = parse_team(data['captain_winner'], nullable=True)
            protocol.additional = data['additional']

            protocol.team1_data = parse_team_protocol_data(data['team1_data'])
            protocol.team2_data = parse_team_protocol_data(data['team2_data'])

            if 'rounds' in data:
                protocol.rounds.clear()
                for i, round_data in enumerate(data['rounds']):
                    protocol.rounds.append(parse_round(round_data, i))

            db_session.merge(protocol)
            db_session.commit()

        except KeyError as e:
            abort(400, success=False, message=str(e))
        return jsonify({"success": True, "game": game.to_dict()})

    def get(self, game_id):
        game = get_model(Game, game_id)
        return jsonify({"protocol": game.protocol.to_dict()})
