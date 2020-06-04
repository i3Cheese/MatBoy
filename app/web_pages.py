from app import login_manager, send_message
from flask import Blueprint, render_template, redirect, abort, request, url_for, flash
from flask import make_response, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from flask_mail import Message
from data import User, Tournament, League, Team, Game, Post, create_session
from app.forms import LoginForm, RegisterForm, TeamForm, TournamentInfoForm, PrepareToGameForm
from app.forms import ResetPasswordStep1, ResetPasswordStep2
from app.token import generate_email_hash, confirm_data, generate_confirmation_token_reset_password
from app.token import confirm_token
from config import config
from wtforms import ValidationError
from typing import List, Tuple
from threading import Thread
from hashlib import md5
import bot


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
    try:
        args = request.args
        uid, hash_st = args.get('uid'), args.get('hash')
        if uid and hash_st:
            if md5((config.CLIENT_ID + uid +
                    config.SECRET_KEY).encode('utf-8')).hexdigest() != hash_st:
                raise ValidationError
            session = create_session()
            try:
                user = session.query(User).filter(
                    User.vk_id == int(args.get('uid'))).first()
            except ValueError:
                raise ValidationError
            if not user:
                flash('Пользователь не найден', "error")
                raise ValidationError
            login_user(user, remember=True)
            return redirect('/')
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
    except ValidationError:
        pass
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
                           email_notifications=form.email_notifications.data
                           )
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


@blueprint.route('/reset_password_step_1', methods=["POST", "GET"])
def reset_password_step_1():
    """Processing the first step of changing the password (search for a user by email)"""
    form = ResetPasswordStep1()
    if form.validate_on_submit():
        email = form.email.data
        token = generate_confirmation_token_reset_password(email)
        reset_password_url = url_for('web_pages.reset_password_step_2',
                                     token=token, _external=True)
        template_html = render_template('reset_password_mail.html', url=reset_password_url)
        msg = Message(
            subject='Восстановление пароля MatBoy',
            recipients=[email],
            sender=config.MAIL_DEFAULT_SENDER,
            html=template_html
        )
        send_message(msg)
        flash('На вашу почту отправлена инструкция по восстановлению пароля', 'success')
        return redirect(url_for('web_pages.login_page'))
    return render_template('reset_password_step_1.html', form=form)


@blueprint.route('/reset_password_step_2/<token>', methods=["POST", "GET"])
def reset_password_step_2(token):
    """Processing the second step of changing the password (password change)"""
    email = confirm_token(token)
    if not email:
        return redirect(url_for('web_pages.reset_password_step_1'))
    form = ResetPasswordStep2()
    if form.validate_on_submit():
        password = form.password.data
        session = create_session()
        user = session.query(User).filter(User.email == email).first()
        user.set_password(password)
        session.merge(user)
        session.commit()
        flash('Пароль успешно изменен', 'success')
        return redirect(url_for('web_pages.login_page'))
    return render_template('reset_password_step_2.html', form=form)


@blueprint.route('/feedback', methods=["POST", "GET"])
@login_required
def feedback():
    """The feedback page"""
    if request.method == 'POST':
        title = request.form.get('title')
        content = request.form.get('content')
        html_message = render_template('feedback_message.html', content=content)
        msg = Message(
            subject='Support: {0} - MatBoy'.format(title),
            recipients=[config.FEEDBACK_MAIL],
            html=html_message,
            sender=config.MAIL_DEFAULT_SENDER
        )
        send_message(msg)
        flash("Сообщение доставленно", 'success')
        return make_response(jsonify({'status': 'ok'}), 200)
    return render_template('feedback.html', menu=make_menu(now='Обратная связь'))


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
                           tour=tour, menu=make_menu(session, tour_id=tour_id))


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

            if form.end.data and form.start.data > form.end.data:
                form.end.errors.append("Турнир заканчивается слишком рано.")
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

            msg = Message(
                subject='Участие в турнире MatBoy',
                recipients=list(emails),
                sender=config.MAIL_DEFAULT_SENDER,
                html=render_template('mails/email/invite_team.html',
                                     team=team, tour=tour)
            )
            # thr_email = Thread(target=send_message, args=[msg])
            thr_vk = Thread(target=bot.invite_message,
                            args=[render_template('mails/vk/invite_team.vkmsg',
                                                  team=team, tour=tour), emails])
            # thr_email.start()
            thr_vk.start()
            return redirect(team.link)
    except ValidationError:
        session.delete(team)

    return render_template("team_request.html",
                           tour=tour,
                           form=form,
                           menu=make_menu(session, tour_id=tour_id, now='Командная заявка'))


@blueprint.route('/tournament/<int:tour_id>/create_post', methods=["GET", "POST"])
@blueprint.route('/tournament/<int:tour_id>/edit_post/<int:post_id>', methods=["GET", "POST"])
@login_required
def create_post(tour_id, post_id=None):
    """Create and edit post"""
    session = create_session()
    tour = session.query(Tournament).get(tour_id)
    if post_id:
        post = session.query(Post).get(post_id)
        if not post:
            flash('Пост не найден', 'error')
            return redirect(url_for('web_pages.tournament_page', tour_id=tour_id))
        return render_template('create_post.html', tour=tour, post=post,
                               menu=make_menu(tour_id=tour_id, now='Редактирование поста'))
    else:
        return render_template('create_post.html', tour=tour,
                               menu=make_menu(tour_id=tour_id, now="Новый пост"))



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
                                          team_id=team_id, ))


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
