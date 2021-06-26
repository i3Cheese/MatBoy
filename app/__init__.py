from flask import Flask
from flask_login import LoginManager
from flask_restful import Api
from flask_mail import Mail
from data import global_init, get_session, User
from data.user import AnonymousUser
from config import config
from threading import Thread
import logging
import os

config.setup()
global_init()

app = Flask(__name__, static_folder=config.STATIC_FOLDER)
for ex in config.JINJA_EXTENSIONS:
    app.jinja_env.add_extension(ex)
app.config.from_object(config)

mail = Mail(app)
from .mails import send_message, send_messages

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.anonymous_user = AnonymousUser


@login_manager.user_loader
def load_user(user_id) -> User:
    session = get_session()
    return session.query(User).get(user_id)


from . import errorhandlers
from . import web_pages
from . import single_pages
from . import web_utils

app.register_blueprint(web_pages.blueprint)
app.register_blueprint(single_pages.blueprint)
app.register_blueprint(web_utils.blueprint)

api = Api(app)
from .resources import TournamentResource
from .resources import UserResource, UsersResource, TeamResource, LeagueResource, LeaguesResource
from .resources import GameResource, GamesResource, ProtocolResource
from .resources import PostResource, TournamentPostsResource

api.add_resource(UserResource, '/api/user/<int:user_id>')
api.add_resource(UsersResource, '/api/user')
api.add_resource(TournamentResource, '/api/tournament/<int:tour_id>')
api.add_resource(TeamResource, '/api/team/<int:team_id>')
api.add_resource(LeagueResource, '/api/league/<int:league_id>')
api.add_resource(LeaguesResource, '/api/league')
api.add_resource(GameResource, '/api/game/<int:game_id>')
api.add_resource(GamesResource, '/api/game')
api.add_resource(ProtocolResource, '/api/game/<int:game_id>/protocol')
api.add_resource(PostResource, '/api/post', '/api/post/<int:post_id>')
api.add_resource(TournamentPostsResource, '/api/tournament/<int:tour_id>/posts')
