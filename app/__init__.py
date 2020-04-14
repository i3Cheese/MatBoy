from flask import Flask, redirect, request, abort
from flask import render_template, make_response, jsonify
from flask_login import LoginManager, login_user, logout_user, current_user
from flask_login import login_required
from data import global_init
from config import config

app = Flask(__name__, static_folder=config.STATIC_FOLDER)
for key, value in config.APP_CONFIG.items():
    app.config[key] = value
    
login_manager = LoginManager()
login_manager.init_app(app)

from . import web_pages
app.register_blueprint(web_pages.blueprint)


def run():
    global_init()
    app.run(host=config.HOST, port=config.APP_PORT, debug=config.DEBUG)


if __name__ == "__main__":
    run()