from flask import Flask, redirect, request, abort
from flask import render_template, make_response, jsonify
from flask_login import LoginManager, login_user, logout_user, current_user
from flask_login import login_required

from data import *
from forms import RegisterForm, LoginForm


app = Flask(__name__)
app.config['SECRET_KEY'] = 'MatBoyIsVeryGoodBoy'
login_manager = LoginManager()
login_manager.init_app(app)


def init_db():
    data_base = "db/matboy.db"
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


@app.route("/login", methods=["POST", "GET"])
def login_page():
    form = LoginForm()
    return render_template("login.html", form=form)


@app.route("/register", methods=["POST", "GET"])
def register_page():
    form = RegisterForm()
    if form.validate_on_submit():
        user = User().fill(email=form.email,
                    name=form.name,
                    patronymic=form.patronymic,
                    city=form.city,
                    birthday=form.birthday,)
        user.set_password(form.password)
        user.save()
        return redirect("/login")
    return render_template("register.html", form=form)



if __name__ == "__main__":
    main()