from flask import Flask, redirect, request, abort
from flask import render_template, make_response, jsonify
from flask_login import LoginManager, login_user, logout_user, current_user
from flask_login import login_required

from data import *


app = Flask(__name__)
app.config['SECRET_KEY'] = 'MatBoyIsVeryGoodBoy'
login_manager = LoginManager()
login_manager.init_app(app)


def init_db():
    data_base = "db/mars_explorer.db"
    global_init(data_base)


def main():
    init_db()
    app.run(debug=True)


@login_manager.user_loader
def load_user(user_id):
    return User.find(user_id)


@app.route("/")
@app.route("/index")
def index_page():
    return render_template("base.html")


@app.route("/login/<path:last_page>", methods=["GET", "POST"])
@app.route("/login/", methods=["GET", "POST"])
def login_page(last_page="/"):
    return render_template("login.html")


@app.route("/register/<path:last_page>", methods=["GET", "POST"])
@app.route("/register/", methods=["GET", "POST"])
def register_page(last_page="/"):
    return render_template("register.html")


if __name__ == "__main__":
    main()