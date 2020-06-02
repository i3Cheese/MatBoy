from flask import Flask
from flask_login import LoginManager
from flask_restful import Api
from flask_mail import Mail
from data import global_init
from data.user import AnonymousUser
from config import config

config.setup()
global_init()

app = Flask(__name__, static_folder=config.STATIC_FOLDER)
app.jinja_options['extensions'].extend(config.JINJA_EXTENSIONS)
app.config.from_object(config)

mail = Mail(app)


def send_message(msg):
    """Send message on email"""
    with app.app_context():
        mail.send(msg)


login_manager = LoginManager()
login_manager.init_app(app)
login_manager.anonymous_user = AnonymousUser

from . import errorhandlers
from . import web_pages
from . import single_pages

app.register_blueprint(web_pages.blueprint)
app.register_blueprint(single_pages.blueprint)


app.jinja_env.globals['client_id'] = app.config['CLIENT_ID']
app.jinja_env.globals['group_id'] = app.config['VK_GROUP_ID']


api = Api(app)

from .resources import UserResource, UsersResource, TeamResource, LeagueResource, LeaguesResource
from .resources import GameResource, GamesResource, ProtocolResource, PostResource

api.add_resource(UserResource, '/api/user/<int:user_id>')
api.add_resource(UsersResource, '/api/user')
api.add_resource(TeamResource, '/api/team/<int:team_id>')
api.add_resource(LeagueResource, '/api/league/<int:league_id>')
api.add_resource(LeaguesResource, '/api/league')
api.add_resource(GameResource, '/api/game/<int:game_id>')
api.add_resource(GamesResource, '/api/game')
api.add_resource(ProtocolResource, '/api/game/<int:game_id>/protocol')
api.add_resource(PostResource, '/api/post/<int:tour_id>', '/api/post/<int:post_id>')
