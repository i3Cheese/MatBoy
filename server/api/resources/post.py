import logging

from flask import jsonify
from flask_login import current_user
from flask_restful import reqparse, abort, Resource

from data import Post, get_session, Tournament, db_session
from data.exceptions import StatusError
from server.api.resources.utils import *
from server.api import api


@api.resource('/post/<int:post_id>')
class PostResource(Resource):
    put_parse = reqparse.RequestParser()
    put_parse.add_argument('title', type=str, required=True)
    put_parse.add_argument('content', type=str, required=True)
    put_parse.add_argument('status', type=str, choices=['archived', 'published'])

    def get(self, post_id):
        session = get_session()
        post = get_post(session, post_id)
        return jsonify({'post': post.to_dict()})

    def put(self, post_id):
        session = get_session()
        args = self.put_parse.parse_args()

        post = get_model(Post, post_id)

        if not post.have_manage_access(current_user):
            abort(403)

        post.title = args['title']
        post.content = args['content']

        if args['status'] is not None and args['status'] != post.status:
            if args['status'] == 'published':
                post.publish()
            else:
                post.archive()

        session.merge(post)
        session.commit()
        return jsonify({"post": post.to_dict()})

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


@api.resource('/post')
class PostsResource(Resource):
    get_pars = reqparse.RequestParser()
    get_pars.add_argument('which', type=str, default='published', location='args', choices=['published', 'archived'])
    get_pars.add_argument('tournament_id', type=int, required=True, location='args')

    post_parse = reqparse.RequestParser()
    post_parse.add_argument('title', required=True, type=str)
    post_parse.add_argument('content', required=True, type=str)
    post_parse.add_argument('tournament_id', required=True, type=int)
    post_parse.add_argument('status')

    def get(self):
        """
        """
        args = self.get_pars.parse_args()
        logging.info(f"Posts get request: {args}")

        tour_id = args['tournament_id']
        tour = get_model(Tournament, tour_id)
        t = args['which']
        if t in ('archived', 'all') and not tour.have_manage_access(current_user):
            abort(403, message="Permission denied")

        query = Post.query.filter(Post.tournament_id == tour_id)
        if t != 'all':
            query = query.filter_by(status=t)

        query.order_by(Post.created_at.desc())
        posts = query.all()
        return jsonify({'posts': list(map(lambda p: p.to_dict(only=(
            "id",
            "title",
            "created_at",
            "updated_at",
            "published_at",
            "tournament.id",
            "tournament.title",
        )), posts))})

    def post(self):
        session = get_session()
        args = self.post_parse.parse_args()
        tour = get_tour(session, args['tournament_id'])
        if not tour.have_manage_access(current_user):
            abort(403)

        post = Post(
            tournament=tour,
            title=args['title'],
            content=args['content'],
            author=current_user,
        )
        if args['status'] == 'published':
            post.publish()

        session.add(post)
        session.commit()
        return jsonify({"post": post.to_dict()})


@api.resource('/post/<int:post_id>/status')
class PostStatusResource(Resource):
    put_pars = reqparse.RequestParser()
    put_pars.add_argument(
        'action',
        type=str,
        required=True,
        choices=["archive", "publish"],
    )

    def put(self, post_id):
        args = self.put_pars.parse_args()
        post = get_model(Post, post_id)
        action = args['action']
        if not post.have_manage_access(current_user):
            abort(403)
        try:
            if action == "archive":
                post.archive()
            elif action == "publish":
                post.publish()
        except StatusError as e:
            abort(400, message=str(e))

        db_session.merge(post)
        db_session.commit()
        return {"success": True}
