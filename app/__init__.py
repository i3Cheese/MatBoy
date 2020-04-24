from flask import Flask, redirect, request, abort
from flask import render_template, make_response, jsonify
from flask_login import LoginManager, login_user, logout_user, current_user
from flask_login import login_required
from flask_restful import Api
from data import global_init
from data.user import AnonymousUser
from config import config

config.setup()
global_init()

app = Flask(__name__, static_folder=config.STATIC_FOLDER)
for key, value in config.APP_CONFIG.items():
    app.config[key] = value
app.jinja_options['extensions'].extend(config.JINJA_EXTENSIONS)
    
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.anonymous_user = AnonymousUser

from . import errorhandlers
from . import web_pages
app.register_blueprint(web_pages.blueprint)


api = Api(app)

from .resources import UserResource, UsersResource, TeamResource, LeagueResource, LeaguesResource
from .resources import GameResource, GamesResource, ProtocolResource
api.add_resource(UserResource, '/api/user/<int:user_id>')
api.add_resource(UsersResource, '/api/users')
api.add_resource(TeamResource, '/api/team/<int:team_id>')
api.add_resource(LeagueResource, '/api/league/<int:league_id>')
api.add_resource(LeaguesResource, '/api/league')
api.add_resource(GameResource, '/api/game/<int:game_id>')
api.add_resource(GamesResource, '/api/game')
api.add_resource(ProtocolResource, '/api/game/<int:game_id>/protocol')
