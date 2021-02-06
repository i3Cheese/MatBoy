from flask_restful import reqparse, abort, Resource, request
from flask_restful.inputs import boolean
from flask import jsonify
from flask_login import current_user, login_required
from data import User, League, Game, Post, create_session
from data.user import AnonymousUser

import logging

from .data_tools import get_user, get_game, get_post, get_team, get_tour, get_league
from .data_tools import to_dict, get_date_from_string, get_datetime_from_string, abort_if_email_exist


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
        session = create_session()
        post = get_post(session, post_id)
        return jsonify({'post': to_dict(post)})

    def put(self, post_id):
        session = create_session()
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
        session = create_session()
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
        session = create_session()
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
        session = create_session()
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
