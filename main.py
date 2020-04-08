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
    session = create_session()
    return session.query(User).get(user_id)


@app.route("/")
@app.route("/index")
def index_page():
    return render_template("base.html")


@app.route("/login", methods=["POST", "GET"])
def login_page():
    form = LoginForm()
    if form.validate_on_submit():
        session = create_session()
        user = session.query(User).filter(User.email == form.email.data).first()
        if not user:
            form.email.errors.append("Пользователь с таким e-mail не зарегестрирован")
        elif not user.check_password(form.password.data):
            form.password.errors.append("Неправильный пароль")
        else:
            login_user(user, remember=True)
            return redirect("/")
    return render_template("login.html", form=form)


@app.route("/register", methods=["POST", "GET"])
def register_page():
    form = RegisterForm()
    if form.validate_on_submit():
        session = create_session()
        user = User().fill(email=form.email.data,
                    name=form.name.data,
                    surname=form.surname.data,
                    patronymic=form.patronymic.data,
                    city=form.city.data,
                    birthday=form.birthday.data,)
        user.set_password(form.password.data)
        session.add(user)
        session.commit()
        return redirect("/login")
    return render_template("register.html", form=form)

@login_required
@app.route("/logout")
def logout_page():
    logout_user()
    return redirect("/")



if __name__ == "__main__":
    main()