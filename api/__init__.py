from flask import Flask, redirect, request, abort
from flask import render_template, make_response, jsonify
from flask_login import LoginManager, login_user, logout_user, current_user
from flask_login import login_required
from data import global_init
from config import config

app = Flask(__name__)
for key, value in config.API_CONFIG.items():
    app.config[key] = value
    
    
from . import web_pages
app.register_blueprint(web_pages.blueprint)


def run():
    global_init()
    app.run(debug=config.DEBUG)


if __name__ == "__main__":
    run()