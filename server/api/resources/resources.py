from flask_restful import reqparse, abort, Resource
from flask_restful.inputs import boolean
from flask import jsonify, request
from flask_login import current_user, login_required
import logging

from data.user import AnonymousUser
from data import User, Team, Tournament, League, Game, Post, get_session
from server.api.resources.utils import *


class ProtocolResource(Resource):
    def put(self, game_id):
        """Gets parts of protocol and complements it"""
        session = get_session()
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
        session = get_session()
        game = get_game(session, game_id)
        return jsonify(game.protocol)


class PostResource(Resource):
    put_parse = reqparse.RequestParser()
    put_parse.add_argument('title', type=str)
    put_parse.add_argument('content', type=str)
    put_parse.add_argument('status')

    post_parse = reqparse.RequestParser()
    post_parse.add_argument('title', required=True, type=str)
    post_parse.add_argument('content', required=True, type=str)
    post_parse.add_argument('tournament_id', required=True, type=int)
    post_parse.add_argument('status')

    def get(self, post_id):
        session = get_session()
        post = get_post(session, post_id)
        return jsonify({'post': to_dict(post)})

    def put(self, post_id):
        session = get_session()
        post = get_post(session, post_id)
        if not post.have_permission(current_user):
            abort(403, message="Permission denied")

        args = self.put_parse.parse_args()
        for key, value in args.items():
            if key == 'status':
                if value and type(value) == str and value.isdigit():
                    post.__setattr__(key, int(value))
                else:
                    if value:
                        post.__setattr__(key, 1)
                    else:
                        post.__setattr__(key, 0)
            elif value is not None:
                post.__setattr__(key, value)
        if post.status:
            post.now = False
        session.commit()
        return jsonify({"success": "ok", "post_id": post.id, "status": post.status,
                        "tour_id": post.tournament_id, "now": post.now})

    def delete(self, post_id):
        """Deleting a post by id"""
        session = get_session()
        post = session.query(Post).filter(Post.id == post_id).first()
        if not post.have_permission(current_user):
            abort(403)
        if post:
            session.delete(post)
            session.commit()
            return jsonify({"success": "ok"})
        else:
            abort(404, message="Post not found")

    def post(self):
        session = get_session()
        args = self.post_parse.parse_args()
        post = Post()
        tour = get_tour(session, args['tournament_id'])
        if not tour.have_permission(current_user):
            abort(403)
        for key, value in args.items():
            if key == 'status':
                if value:
                    post.__setattr__(key, 1)
                    post.now = False
                else:
                    post.__setattr__(key, 0)
                    post.now = True
            else:
                post.__setattr__(key, value)
        post.author_id = current_user.get_id()
        session.add(post)
        session.commit()
        return jsonify({"success": "ok", "post_id": post.id, "status": post.status,
                        "tour_id": post.tournament_id, "now": post.now})


class TournamentPostsResource(Resource):
    get_pars = reqparse.RequestParser()
    get_pars.add_argument('type', type=str, default='visible', location='args')
    get_pars.add_argument('last_id', type=int,
                          help="Не правильно указан last_id", location='args')
    get_pars.add_argument('offset',
                          type=int,
                          help="Не правильно указан offset",
                          default=10,
                          location='args')

    def get(self, tour_id):
        """
        Get existing (status != 0) posts for current tournament
        Request args:
        type 'hidden' - get hidden posts for current tournament
        type 'visible' - get visible posts for current tournament
        type 'all' - get all posts for current tournament
        """
        args = self.get_pars.parse_args()
        logging.info(f"Posts get request: {args}")
        session = get_session()
        tour = get_tour(session, tour_id)
        t = args['type']
        if t in ('hidden', 'all') and not tour.have_permission(current_user):
            abort(403, message="Permission denied")

        query = session.query(Post).filter(Post.tournament_id == tour_id)
        if t != 'all':
            status = 0 if t == 'hidden' else 1
            query = query.filter_by(status=status)

        last_id = args['last_id']
        if last_id is not None:  # Send only posts that were created earlier then Post#post_id
            created_at = get_post(session, last_id).created_at
            query = query.filter(
                Post.created_at <= created_at, Post.id != last_id)

        query.order_by()

        offset = args['offset']
        posts = query.order_by(Post.created_at.desc()).limit(offset)

        return jsonify({'posts': list(map(to_dict, posts))})
