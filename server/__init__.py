import os

from flask import Flask
from flask_login import LoginManager
from flask_mail import Mail
import wtforms_json

from data import global_init, get_session, User
from data.user import AnonymousUser
from config import config


def make_dir(name):
    try:
        os.mkdir(name)
    except FileExistsError:
        pass


def create_dirs():
    make_dir('db')
    make_dir('static/img/user_content')


create_dirs()
wtforms_json.init()
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


# from . import errorhandlers
# from . import web_pages
from . import web_utils

# app.register_blueprint(web_pages.blueprint)
app.register_blueprint(web_utils.blueprint)

import server.api
