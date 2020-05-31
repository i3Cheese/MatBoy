from app import login_manager, send_message
from flask import Blueprint, render_template, redirect, abort, request, url_for, flash
from flask_login import login_user, logout_user, login_required, current_user
from flask_mail import Message
from data import User, Tournament, League, Team, Game, create_session
from app.forms import LoginForm, RegisterForm, TeamForm, TournamentInfoForm, PrepareToGameForm
from app.token import generate_email_hash, confirm_data
from config import config
from wtforms import ValidationError
from typing import List, Tuple
import logging
from threading import Thread

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


def make_menu(session=None, *,
              tour_id=None, league_id=None, game_id=None,
              team_id=None, user_id=None, now=None) -> List[Tuple[str, str]]:
    """Make a menu for web_pages. List[Tuple[title, link]]"""
    menu = []
    try:
        for cls, id in [(Tournament, tour_id),
                        (League, league_id),
                        (Game, game_id),
                        (Team, team_id),
                        (User, user_id)]:
            if id is None:
                continue
            if session is None:
                session = create_session()
            item = session.query(cls).get(id)
            menu.append((str(item), item.link))
    except AttributeError:
        abort(404)
    if now:
        menu.append((now, request.path))
    return menu


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
                           birthday=form.birthday.data, )
        user.set_password(form.password.data)
        session.add(user)
        session.commit()
        return redirect("/login")
    return render_template("register.html", form=form)


@blueprint.route("/logout")
@login_required
def logout_page():
    logout_user()
    return back_redirect("/login")


@blueprint.route("/profile/<int:user_id>")
def user_page(user_id):
    session = create_session()
    user = session.query(User).get(user_id)
    if not user:
        abort(404)
    return render_template("profile.html",
                           user=user,
                           menu=make_menu(session, user_id=user_id))


@blueprint.route("/tournament/<int:tour_id>")
def tournament_page(tour_id):
    session = create_session()
    tour = session.query(Tournament).get(tour_id)
    if not tour:
        abort(404)
    return render_template("tournament.html",
                           tour=tour,
                           menu=make_menu(session, tour_id=tour_id))


@blueprint.route("/new_tournament", methods=["POST", "GET"])
@login_required
def tournament_creator_page():
    if not current_user.is_creator:
        abort(403)
    form = TournamentInfoForm()
    try:
        if form.validate_on_submit():
            session = create_session()
            if session.query(Tournament).filter(Tournament.title == form.title.data).first():
                form.title.errors.append(
                    "Турнир с таким названием уже существует")
                raise ValidationError
            tournament = Tournament().fill(title=form.title.data,
                                           description=form.description.data,
                                           place=form.place.data,
                                           start=form.start.data,
                                           end=form.end.data,
                                           chief_id=current_user.id, )
            session.add(tournament)
            session.commit()

            return redirect("/")
    except ValidationError:
        pass
    return render_template("tournament_editor.html",
                           form=form,
                           menu=make_menu(now="Новый турнир"))


@blueprint.route("/tournament/<int:tour_id>/edit", methods=["POST", "GET"])
@login_required
def tournament_edit_page(tour_id: int):
    session = create_session()
    tour = session.query(Tournament).get(tour_id)
    if not tour:
        abort(404)
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

        return back_redirect("{0}/console".format(tour.link))

    elif not form.is_submitted():
        form.title.data = tour.title
        form.description.data = tour.description
        form.place.data = tour.place
        form.start.data = tour.start
        form.end.data = tour.end

    return render_template("tournament_editor.html",
                           form=form,
                           menu=make_menu(session, tour_id=tour_id, now='Редактирование'))


@blueprint.route("/tournament/<int:tour_id>/console")
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

    return render_template("tournament_console.html",
                           tour=tour,
                           menu=make_menu(session, tour_id=tour_id, now='Консоль'))


@blueprint.route("/tournament/<int:tour_id>/team_request", methods=["GET", "POST"])
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
            session.add(team)
            session.commit()
            for email in emails:
                url_hash = generate_email_hash(team.id, email)
                invite_url = url_for('web_pages.invite_team', url_hash=url_hash, _external=True)
                msg = Message(
                    subject='Приглашение на участие в турнире MatBoy',
                    recipients=[email],
                    sender=config.MAIL_DEFAULT_SENDER,
                    html=render_template('invite_team.html',
                                         team=team, tour=tour, invite_url=invite_url)
                )
                thr = Thread(target=send_message, args=[msg])
                thr.start()
            return redirect(team.link)
    except ValidationError:
        session.delete(team)

    return render_template("team_request.html",
                           tour=tour,
                           form=form,
                           menu=make_menu(session, tour_id=tour_id, now='Командная заявка'))


@blueprint.route('/invite_team/<url_hash>')
@login_required
def invite_team(url_hash):
    data = confirm_data(url_hash)
    if data:
        team_id = data['team_id']
        email = data['email']
        if email != current_user.email:
            abort(403)
        session = create_session()
        user = session.query(User).get(int(current_user.id))
        team = session.query(Team).get(int(team_id))
        team.players.append(user)
        session.merge(team)
        session.commit()
        flash('Вы вступили в команду {0}'.format(team.name), 'success')
    return redirect(url_for('web_pages.index_page'))


@blueprint.route("/tournament/<int:tour_id>/team/<int:team_id>")
def team_page(team_id, tour_id):
    session = create_session()
    team = session.query(Team).get(team_id)
    if not (team and team.check_relation(tour_id)):
        abort(404)
    return render_template("team.html",
                           team=team,
                           menu=make_menu(session,
                                          tour_id=tour_id,
                                          team_id=team_id,))


@blueprint.route("/tournament/<int:tour_id>/league/<int:league_id>")
def league_page(tour_id, league_id):
    session = create_session()
    league = session.query(League).get(league_id)
    if not (league and league.check_relation(tour_id)):
        abort(404)
    return render_template("league.html",
                           league=league,
                           menu=make_menu(session,
                                          tour_id=tour_id,
                                          league_id=league_id))


@blueprint.route("/tournament/<int:tour_id>/league/<int:league_id>/console")
@login_required
def league_console(tour_id: int, league_id: int):
    """Web page for manage league"""
    session = create_session()
    league = session.query(League).get(league_id)
    if not (league and league.check_relation(tour_id)):
        abort(404)

    if not league.have_permission(current_user):
        abort(403)

    return render_template("league_console.html",
                           league=league,
                           menu=make_menu(session,
                                          tour_id=tour_id,
                                          league_id=league_id,
                                          now='Консоль'))


@blueprint.route("/tournament/<int:tour_id>/league/<int:league_id>/game/<int:game_id>")
def game_page(tour_id, league_id, game_id):
    session = create_session()
    game = session.query(Game).get(game_id)
    if not (game and game.check_relation(tour_id, league_id)):
        abort(404)
    return render_template("game.html",
                           game=game,
                           menu=make_menu(session,
                                          tour_id=tour_id,
                                          league_id=league_id,
                                          game_id=game_id))


@blueprint.route("/tournament/<int:tour_id>/league/<int:league_id>/game/<int:game_id>/prepare",
                 methods=["GET", "POST"])
@login_required
def prepare_to_game(tour_id, league_id, game_id):
    session = create_session()
    game = session.query(Game).get(game_id)
    if not (game and game.check_relation(tour_id, league_id)):
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
                        player = session.query(User).get(
                            player_field.player_id)
                        if not player:
                            player_field.errors.append("Не найден")
                            raise ValidationError
                        team_json['players'].append(player.to_short_dict())
                game.protocol['teams'].append(team_json)
            session.merge(game)
            session.commit()
            return redirect("{0}/console".format(game.link))
        except ValidationError:
            return render_template("prepare_to_game.html", game=game, form=form)

    return render_template("prepare_to_game.html",
                           game=game,
                           form=form,
                           menu=make_menu(session,
                                          tour_id=tour_id,
                                          league_id=league_id,
                                          game_id=game_id,
                                          now="Участники"))


@blueprint.route("/tournament/<int:tour_id>/league/<int:league_id>/game/<int:game_id>/console")
@login_required
def game_console(tour_id, league_id, game_id):
    session = create_session()
    game = session.query(Game).get(game_id)
    if not (game and game.check_relation(tour_id, league_id)):
        abort(404)
    if not game.have_permission(current_user):
        abort(403)
    return render_template("game_console.html",
                           game=game,
                           menu=make_menu(session,
                                          tour_id=tour_id,
                                          league_id=league_id,
                                          game_id=game_id,
                                          now='Консоль'))
