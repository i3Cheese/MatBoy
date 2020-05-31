from app import login_manager
from flask import Blueprint, render_template, redirect, abort, request
from flask_login import login_user, logout_user, login_required, current_user
from data import User, Tournament, League, Team, Game, create_session
from app.forms import LoginForm, RegisterForm, TeamForm, TournamentInfoForm, PrepareToGameForm
from config import config
from wtforms import ValidationError
import logging


blueprint = Blueprint('web_pages',
                      __name__,
                      template_folder=config.TEMPLATES_FOLDER,
                      static_folder=config.STATIC_FOLDER,
                      )


def back_redirect(reserve_path='/'):
    path = request.args.get("comefrom")
    if not path:
        path = reserve_path

    return redirect(path)


@login_manager.user_loader
def load_user(user_id) -> User:
    session = create_session()
    return session.query(User).get(user_id)


@blueprint.route("/")
@blueprint.route("/index")
def index_page():
    session = create_session()
    tournaments = session.query(Tournament).all()
    return render_template("index.html", tournaments=tournaments)


@blueprint.route("/tournament/<int:tour_id>")
def tournament_page(tour_id):
    session = create_session()
    tour = session.query(Tournament).get(tour_id)
    if not tour:
        abort(404)
    return render_template("tournament.html", tour=tour)


@blueprint.route("/league/<int:league_id>")
def league_page(league_id):
    session = create_session()
    league = session.query(League).get(league_id)
    if not league:
        abort(404)
    return render_template("league.html", league=league)


@blueprint.route("/team/<int:team_id>")
def team_page(team_id):
    session = create_session()
    team = session.query(Team).get(team_id)
    if not team:
        abort(404)
    return render_template("team.html", team=team)


@blueprint.route("/profile/<int:user_id>")
def user_page(user_id):
    session = create_session()
    user = session.query(User).get(user_id)
    if not user:
        abort(404)
    return render_template("profile.html", user=user)


@blueprint.route("/game/<int:game_id>")
def game_page(game_id):
    session = create_session()
    game = session.query(Game).get(game_id)
    if not game:
        abort(404)
    return render_template("game.html", game=game)


@blueprint.route("/login", methods=["POST", "GET"])
def login_page():
    form = LoginForm()
    if form.validate_on_submit():
        session = create_session()
        user = session.query(User).filter(
            User.email == form.email.data).first()
        if not user:
            form.email.errors.append(
                "Пользователь с таким e-mail не зарегестрирован")
        elif not user.check_password(form.password.data):
            form.password.errors.append("Неправильный пароль")
        else:
            login_user(user, remember=True)
            return back_redirect()
    return render_template("login.html", form=form)


@blueprint.route("/register", methods=["POST", "GET"])
def register_page():
    form = RegisterForm()
    if form.validate_on_submit():
        session = create_session()
        user = User().fill(email=form.email.data,
                           name=form.name.data,
                           surname=form.surname.data,
                           patronymic=form.patronymic.data,
                           city=form.city.data,
                           birthday=form.birthday.data,
                           email_notifications=form.email_notifications.data,
                           vk_notifications=form.vk_notifications.data)
        user.set_password(form.password.data)
        if request.args.get('user_id', 0):
            user.vk_id = int(request.args.get('user_id'))
            user.integration_with_VK = True
        session.add(user)
        session.commit()
        return redirect("/login")
    return render_template("register.html", form=form)


@blueprint.route("/logout")
@login_required
def logout_page():
    logout_user()
    return back_redirect("/login")


@blueprint.route("/new_tournament", methods=["POST", "GET"])
@login_required
def tournament_creator_page():
    if not current_user.is_creator:
        abort(403)
    form = TournamentInfoForm()
    if form.validate_on_submit():
        session = create_session()
        if session.query(Tournament).filter(Tournament.title == form.title.data).first():
            form.title.errors.append("Турнир с таким названием уже существует")
        tournament = Tournament().fill(title=form.title.data,
                                       description=form.description.data,
                                       place=form.place.data,
                                       start=form.start.data,
                                       end=form.end.data,
                                       chief_id = current_user.id,)
        session.add(tournament)
        session.commit()

        return redirect("/")
    return render_template("tournament_editor.html", form=form)


@blueprint.route("/edit_tournament/<int:tour_id>", methods=["POST", "GET"])
@login_required
def tournament_edit_page(tour_id: int):
    session = create_session()
    tour = session.query(Tournament).get(tour_id)
    if not tour.have_permission(current_user):
        abort(403)
    form = TournamentInfoForm()
    if form.validate_on_submit():
        new_title = form.title.data
        # if title changed and new_title exist
        if (new_title != tour.title) and (
                session.query(Tournament).filter(Tournament.title == new_title).first()):
            form.title.errors.append("Турнир с таким названием уже существует")
            return render_template("tournament_editor.html", form=form)

        # Change tour values
        tour.title = new_title
        tour.description = form.description.data
        tour.place = form.place.data
        tour.start = form.start.data
        tour.end = form.end.data
        session.merge(tour)
        session.commit()

        return back_redirect(f"/tournament_console/{tour_id}")

    elif not form.is_submitted():
        form.title.data = tour.title
        form.description.data = tour.description
        form.place.data = tour.place
        form.start.data = tour.start
        form.end.data = tour.end

    return render_template("tournament_editor.html", form=form)


@blueprint.route("/team_request/<int:tour_id>", methods=["GET", "POST"])
@login_required
def team_request(tour_id: int):
    form = TeamForm()
    session = create_session()
    tour = session.query(Tournament).get(tour_id)
    if not tour:
        abort(404)
    try:
        if form.validate_on_submit():
            team = Team().fill(
                name=form.name.data,
                motto=form.motto.data,
                trainer_id=current_user.id,
                tournament_id=tour.id,
            )
            
            emails = set()
            for field in form.players.entries:
                email = field.data.lower()
                if email in emails:
                    field.errors.append("Участник указан несколько раза")
                    raise ValidationError
                emails.add(email)
                user = session.query(User).filter(User.email == email).first()
                if not user:
                    field.errors.append("Пользователь не найден.")
                    raise ValidationError
                team.players.append(user)
            session.add(team)
            session.commit()
            return redirect(f"/team/{team.id}")
    except ValidationError:
        pass

    return render_template("team_request.html", tour=tour, form=form)


@blueprint.route("/tournament_console/<int:tour_id>")
@login_required
def tournament_console(tour_id: int):
    """Web page for manage tournament"""
    session = create_session()
    tour = session.query(Tournament).get(tour_id)
    if not tour:
        abort(404)
    # If user haven't access to tournament
    if not tour.have_permission(current_user):
        abort(403)

    return render_template("tournament_console.html", tour=tour)


@blueprint.route("/league_console/<int:league_id>")
@login_required
def league_console(league_id: int):
    """Web page for manage league"""
    session = create_session()
    league = session.query(League).get(league_id)
    if not league:
        abort(404)

    if not league.have_permission(current_user):
        abort(403)

    return render_template("league_console.html", league=league)


@blueprint.route("/prepare_to_game/<int:game_id>", methods=["GET", "POST"])
@login_required
def prepare_to_game(game_id):
    session = create_session()
    game = session.query(Game).get(game_id)
    if not game:
        abort(404)

    if not game.have_permission(current_user):
        abort(403)

    form = PrepareToGameForm(game)

    if form.validate_on_submit():
        try:  # Convert form to json
            if game.protocol is None:
                game.protocol = {'teams': []}

            game.protocol['teams'] = []

            for t_d in form.teams.values():
                team_json = {}

                cap = session.query(User).get(t_d['captain'].data)
                if not cap:
                    t_d['captain'].errors.append("Не найден")
                    raise ValidationError

                deputy = session.query(User).get(t_d['deputy'].data)
                if not deputy:
                    t_d['deputy'].errors.append("Не найден")
                    raise ValidationError

                team_json['captain'] = cap.to_short_dict()
                team_json['deputy'] = deputy.to_short_dict()
                team_json['players'] = []
                for player_field in t_d['players']:
                    if player_field.data:
                        player = session.query(User).get(player_field.player_id)
                        if not player:
                            player_field.errors.append("Не найден")
                            raise ValidationError
                        team_json['players'].append(player.to_short_dict())
                game.protocol['teams'].append(team_json)
            session.merge(game)
            session.commit()
            return redirect(f"/game_console/{game.id}")
        except ValidationError:
            return render_template("prepare_to_game.html", game=game, form=form)

    return render_template("prepare_to_game.html", game=game, form=form)


@blueprint.route("/game_console/<int:game_id>")
@login_required
def game_console(game_id):
    session = create_session()
    game = session.query(Game).get(game_id)
    if not game:
        abort(404)
    if not game.have_permission(current_user):
        abort(403)
    return render_template("game_console.html", game=game)
