from flask_restful import reqparse, abort, Resource, request
from flask_restful.inputs import boolean
from flask import jsonify
from flask_login import current_user, login_required
from data import User, Team, Tournament, League, Game, Post, create_session
from datetime import date, datetime
import logging


def get_date_from_string(strdate: str) -> date:
    if not strdate:
        return None
    return date.fromisoformat('-'.join(reversed(strdate.split("."))))


def get_datetime_from_string(strdatetime: str) -> datetime:
    if not strdatetime:
        return None
    dt, tm = strdatetime.split(' ')
    dt = '-'.join(reversed(dt.split('.')))
    return datetime.fromisoformat(dt + ' ' + tm)


def get_user(session, user_id=None, email=None, do_abort=True) -> User:
    """
    Get User from database, abort(404) if do_abort==True and user not found

    If user.id and user.email specified in the same time
    user was looking by user.id
    """
    if user_id:
        user = session.query(User).get(user_id)
        if do_abort and not user:
            abort(404, message=f"Пользователь #{user_id} не найден")
    elif email:
        user = session.query(User).filter(User.email == email.lower()).first()
        if do_abort and not user:
            abort(404, message=f"Пользователь с e-mail {email} не найден")
    else:
        return None
    return user


def get_team(session, team_id, do_abort=True) -> Team:
    """Get Team from database, abort(404) if do_abort==True and team not found"""
    team = session.query(Team).get(team_id)
    if do_abort and not team:
        abort(404, message=f"Team #{team_id} not found")
    return team


def get_tour(session, tour_id, do_abort=True) -> Tournament:
    """Get Tournament from database, abort(404) if do_abort==True and tournament not found"""
    tour = session.query(Tournament).get(tour_id)
    if do_abort and not tour:
        abort(404, message=f"Tournament #{tour_id} not found")
    return tour


def get_league(session, league_id, do_abort=True) -> League:
    """Get League from database, abort(404) if do_abort==True and league not found"""
    league = session.query(League).get(league_id)
    if do_abort and not league:
        abort(404, message=f"League #{league_id} not found")
    return league


def get_game(session, game_id, do_abort=True) -> Game:
    """Get Game from database, abort(404) if do_abort==True and game not found"""
    game = session.query(Game).get(game_id)
    if do_abort and not game:
        abort(404, message=f"Game #{game_id} not found")
    return game


def get_post(session, post_id, do_abort=True) -> Post:
    """Get Post from database, abort(404) if do_abort==True and post not found"""
    post = session.query(Post).get(post_id)
    if do_abort and not post:
        abort(404, message=f"Post #{post_id} not found")
    return post


def abort_if_email_exist(session, email):
    user = session.query(User).filter(User.email == email).first()
    logging.info(repr(user))
    if user is not None:
        abort(
            409, message=f"Пользователь с e-mail {repr(email)} уже зарегестрирован")


def to_dict(obj):
    """Serialize object with check permissions"""
    if obj.have_permission(current_user) or (isinstance(obj, User) and obj == current_user):
        return obj.to_dict()
    else:
        return obj.to_secure_dict()


class UserResource(Resource):
    put_pars = reqparse.RequestParser()
    put_pars.add_argument('vk_id', type=int, help="wrong type")

    def get(self, user_id: int):
        session = create_session()
        user = get_user(session, user_id)
        d = to_dict(user)
        return jsonify({"user": d})

    def put(self, user_id: int):
        args = self.put_pars.parse_args()
        session = create_session()
        user = get_user(session, user_id)
        if current_user != user and not current_user.is_admin:
            abort(403)
        if args['vk_id'] is not None:
            user.vk_id = args['vk_id']
            user.integration_with_VK = True
        session.commit()
        return jsonify({"success": "ok"})


class UsersResource(Resource):
    reg_pars = reqparse.RequestParser()
    reg_pars.add_argument('surname', required=True, type=str)
    reg_pars.add_argument('name', required=True, type=str)
    reg_pars.add_argument('patronymic', required=False, type=str)
    reg_pars.add_argument('city', required=False, type=str)
    reg_pars.add_argument('birthday', required=True, type=get_date_from_string)
    reg_pars.add_argument('email', required=True, type=str)
    reg_pars.add_argument('password', required=True, type=str)

    get_pars = reqparse.RequestParser()
    get_pars.add_argument('vk_id', type=int, help="wrong type", location='args')
    get_pars.add_argument('check', type=boolean, default=False, location='args')

    def post(self):
        args = UsersResource.reg_pars.parse_args()
        session = create_session()
        abort_if_email_exist(session, args['email'])
        user = User().fill(email=args['email'],
                           name=args['name'],
                           surname=args['surname'],
                           patronymic=args['patronymic'],
                           city=args['city'],
                           birthday=args['birthday'],
                           )
        user.set_password(args['password'])
        session.add(user)
        session.commit()
        return jsonify({"success": "ok"})

    def get(self):
        session = create_session()
        args = self.get_pars.parse_args()
        if args['vk_id']:
            user = session.query(User).filter(User.vk_id == args['vk_id']).first()
            if args['check']:
                json_resp = {'exist': user is not None}
            else:
                if not user:
                    abort(404)
                json_resp = to_dict(user)
        else:
            users = session.query(User).all()
            json_resp = {"users": [user.to_dict(only=("id",
                                                      "name",
                                                      "surname",
                                                      "fullname",)) for user in users]}
        return jsonify(json_resp)


class TeamResource(Resource):
    put_pars = reqparse.RequestParser()
    put_pars.add_argument('name', type=str)
    put_pars.add_argument('motto', type=str)
    put_pars.add_argument('status', type=int)
    put_pars.add_argument('league.id', type=int)  # 0 == None
    put_pars.add_argument('send_info', type=boolean, default=False)

    def get(self, team_id: int):
        session = create_session()
        team = get_team(session, team_id)
        return jsonify(to_dict(team))

    @login_required
    def put(self, team_id):
        """If trainer.id and trainer.email specified in the same time
           trainer was looking by trainer.id"""
        args = self.put_pars.parse_args()
        logging.info(f"Team put request with args {args}")

        session = create_session()
        team = get_team(session, team_id)

        if not (args['league.id'] is None and args['status'] is None):
            if not team.tournament.have_permission(current_user):
                abort(403, message="You haven't access to tournament")
            if args['league.id'] is not None:
                if args['league.id'] == 0:
                    team.league = None
                else:
                    team.league = get_league(session, args['league.id'])
            if args['status'] is not None:
                team.status = args['status']
            if team.status >= 2 and team.league is None:
                abort(400, message="Принятая команда должна быть привязана к лиге")

        if not (args['name'] is None and args['motto'] is None) or args['send_info']:
            if not team.have_permission(current_user):
                abort(403, message="You haven't access to team")
            if args['name'] is not None:
                if not args['name']:
                    abort(400, message="Название не может быть пустым")
                team.name = args['name']
            if args['motto'] is not None:
                team.motto = args['motto']
        session.merge(team)
        session.commit()

        response = {'success': 'ok'}
        if args['send_info']:
            response['team'] = team.to_dict()
        return response

    @login_required
    def delete(self, team_id):
        session = create_session()
        team = get_team(session, team_id)
        if not team.have_permission(current_user):
            abort(403, message="Permission denied")
        team.status = 0
        session.merge(team)
        session.commit()
        return jsonify({'success': 'ok'})


class LeagueResource(Resource):
    put_pars = reqparse.RequestParser()
    put_pars.add_argument('title', type=str)
    put_pars.add_argument('description', type=str)
    put_pars.add_argument('chief.id', type=int)
    put_pars.add_argument('chief.email', type=str)
    put_pars.add_argument('tournament.id', type=int)
    put_pars.add_argument('send_info', type=boolean, default=False)

    def get(self, league_id: int):
        session = create_session()
        league = get_league(session, league_id)
        if league.have_permission(current_user):
            d = league.to_dict()
        else:
            d = league.to_secure_dict()
        return jsonify({'league': d})

    @login_required
    def put(self, league_id):
        """Handle request to change league."""
        args = self.put_pars.parse_args()
        logging.info(f"League put request with args {args}")

        session = create_session()
        league = get_league(session, league_id)
        if not league.have_permission(current_user):
            abort(403, message="Permission denied")

        if not (args['chief.id'] is None and args['chief.email'] is None):
            league.chief = get_user(session,
                                    user_id=args['chief.id'],
                                    email=args['chief.email'],
                                    )
        if args['tournament.id'] is not None:
            league.tournament = get_tour(session, args['tournament.id'])
        if args['title'] is not None:
            if not args['title']:
                abort(400, message="Название не может быть пустым")
            league.title = args['title']
        if args['description'] is not None:
            league.description = args['description']
        session.merge(league)
        session.commit()

        response = {"success": "ok"}
        if args['send_info']:
            response["league"] = league.to_dict()
        return jsonify(response)

    @login_required
    def delete(self, league_id):
        """Delete this league and set league.teams.status to <=1"""
        session = create_session()
        league = get_league(session, league_id, do_abort=False)
        if not league.have_permission(current_user):
            abort(403, message="Permission denied")

        if not league:
            return jsonify({'success': 'ok'})

        for team in league.teams:
            team.league_id = None
            if team.status != 0:
                team.status = 1
            session.merge(team)

        session.delete(league)
        session.commit()
        return jsonify({'success': 'ok'})


class LeaguesResource(Resource):
    post_pars = LeagueResource.put_pars.copy()
    post_pars.replace_argument(
        'title', type=str, required=True, help="Необходимо указать название")
    post_pars.replace_argument('tournament.id', type=int, required=True)

    @login_required
    def post(self):
        """Handle request to create league."""
        args = self.post_pars.parse_args()
        logging.info(f"League post request with args {args}")

        session = create_session()
        tour = get_tour(session, args['tournament.id'])
        if not tour.have_permission(current_user):
            abort('403', message="Permission denied")

        league = League()
        league.tournament = tour
        if args['chief.id'] is None and args['chief.email'] is None:
            abort(400, message={
                "chief": "Не указана информация о главном по лиге"})
        else:
            league.chief = get_user(session,
                                    user_id=args['chief.id'],
                                    email=args['chief.email'], )
        league.title = args['title']
        if args['description'] is not None:
            league.description = args['description']
        session.add(league)
        session.commit()

        response = {"success": "ok"}
        if args['send_info']:
            response["league"] = league.to_dict()
        return jsonify(response)


class GameResource(Resource):
    put_pars = reqparse.RequestParser()
    put_pars.add_argument('place', type=str)
    # Empty string == None
    put_pars.add_argument(
        'start', type=get_datetime_from_string, help="Неверный формат даты")
    put_pars.add_argument('status', type=int)
    put_pars.add_argument('judge.id', type=int)
    put_pars.add_argument('judge.email', type=str)
    put_pars.add_argument('league.id', type=int,
                          help="Неправильно указана лига")
    put_pars.add_argument('team1.id', type=int,
                          help="Неправильный указана команда")
    put_pars.add_argument('team2.id', type=int,
                          help="Неправильно указана команда")
    put_pars.add_argument('send_info', type=boolean, default=False)

    def get(self, game_id):
        session = create_session()
        game = get_game(session, game_id)
        if game.have_permission(current_user):
            d = game.to_dict()
        else:
            d = game.to_short_dict()
        return jsonify({'game': d})

    @login_required
    def put(self, game_id):
        """Handle request to change game."""
        args = self.put_pars.parse_args()
        logging.info(f"Game put request: {args}")

        session = create_session()
        game = get_game(session, game_id)
        if not game.have_permission(current_user):
            abort(403, message="Permission denied")

        if args['place'] is not None:
            game.place = args['place']
        if args['start'] is not None:
            game.start = args['start']
        if args['status'] is not None:
            s = args['status']
            if s == 3:
                game.finish()
            elif s == 2:
                game.start_game()
            elif s == 1:
                game.restore()
            elif s == 0:
                game.delete()
            else:
                abort(400, message="Wrong status value")

        if not (args['judge.id'] is None and args['judge.email'] is None):
            game.judge = get_user(session,
                                  user_id=args['judge.id'],
                                  email=args['judge.email'], )

        if not (args['team1.id'] is None and args['team2.id'] is None):
            if args['team1.id'] is not None:
                game.team1 = get_team(session, args['team1.id'])
            if args['team2.id'] is not None:
                game.team2 = get_team(session, args['team2.id'])
            if game.team1 == game.team2:
                abort(400, message="Команды должны быть различны")
        if args['league.id'] is not None:
            game.league = get_league(session, args['league.id'])

        session.merge(game)
        session.commit()

        response = {"success": "ok"}
        if args['send_info']:
            response["game"] = game.to_dict()
        logging.info(f"Game put response: {response}")
        return jsonify(response)

    @login_required
    def delete(self, game_id):
        """Sets the status of game to zero. Thats mean that the game is canceled"""
        session = create_session()
        game = get_game(session, game_id)
        if not game.have_permission(current_user):
            abort(403, message="Permission denied")
        game.status = 0
        session.merge(game)
        session.commit()
        return jsonify({"success": "ok"})


class GamesResource(Resource):
    post_pars = GameResource.put_pars.copy()
    post_pars.replace_argument('league.id', type=int, required=True)
    post_pars.replace_argument('team1.id', type=int,
                               required=True, help="Неправильный указана команда")
    post_pars.replace_argument('team2.id', type=int,
                               required=True, help="Неправильно указана команда")

    @login_required
    def post(self):
        """Handle request to change game."""
        args = self.post_pars.parse_args()
        logging.info(f"Game post request: {args}")

        session = create_session()
        league = get_league(session, args['league.id'])
        if not league.have_permission(current_user):
            abort(403, message="Permission denied")

        game = Game()
        game.league = league
        if args['place'] is not None:
            game.place = args['place']
        if args['start'] is not None:
            game.start = args['start']
        if not (args['judge.id'] is None and args['judge.email'] is None):
            game.judge = get_user(session,
                                  user_id=args['judge.id'],
                                  email=args['judge.email'], )
        else:
            abort(400, message="Не указана информация о судье")
        game.team1 = get_team(session, args['team1.id'])
        game.team2 = get_team(session, args['team2.id'])
        if game.team1 == game.team2:
            abort(400, message="Команды должны быть различны")

        session.add(game)
        session.commit()

        response = {"success": "ok"}
        if args['send_info']:
            response["game"] = game.to_dict()
        logging.info(f"Game post response: {response}")
        return jsonify(response)


class ProtocolResource(Resource):
    @login_required
    def put(self, game_id):
        """Gets parts of protocol and complements it"""
        session = create_session()
        game = get_game(session, game_id)
        logging.info(f"Protocol put with json {request.json}")
        if not game.have_permission(current_user):
            abort(403, message="Permission denied")

        if 'teams' in request.json:
            game.protocol['teams'] = request.json['teams']

        if 'captain_winner' in request.json:
            try:
                game.captain_winner = int(request.json['captain_winner'])
            except ValueError as e:
                abort(400, message=str(e))

        if 'rounds' in request.json:
            rounds = request.json['rounds']
            teams_points = [0, 0]
            teams_stars = [0, 0]
            for round in rounds:
                for i, team in enumerate(round['teams']):
                    team['points'] = int(team.get('points', 0))
                    team['stars'] = int(team.get('stars', 0))
                    teams_points[i] += team['points']
                    teams_stars[i] += team['stars']
                    if 'player' in team:
                        player = None
                        if isinstance(team['player'], int):
                            player = get_user(
                                session, team['player'], do_abort=False)
                        elif isinstance(team['player'], dict):
                            player = get_user(session, team['player'].get(
                                'id', 0), do_abort=False)
                        if player:
                            team['player'] = player.to_short_dict()
                        else:
                            del team['player']
            game.protocol['rounds'] = rounds
            game.protocol['points'] = teams_points + \
                                      [len(rounds) * 12 - sum(teams_points), ]
            game.protocol['stars'] = teams_stars

        session.merge(game)
        session.commit()
        return jsonify({"success": "ok"})

    def get(self, game_id):
        session = create_session()
        game = get_game(session, game_id)
        return jsonify(game.protocol)


class PostResource(Resource):
    put_parse = reqparse.RequestParser()
    put_parse.add_argument('title', type=str)
    put_parse.add_argument('content', type=str)
    put_parse.add_argument('status')

    post_parse = reqparse.RequestParser()
    post_parse.add_argument('title', required=True, type=str)
    post_parse.add_argument('content', required=True, type=str)
    post_parse.add_argument('tournament_id', required=True, type=int)
    post_parse.add_argument('status')

    def get(self, post_id):
        """Get a post by id"""
        session = create_session()
        post = get_post(session, post_id)
        if post.have_permission(current_user):
            d = post.to_dict()
        else:
            d = post.to_secure_dict()
        return jsonify({'post': d})

    def put(self, post_id):
        """Edit a post by id"""
        session = create_session()
        post = get_post(session, post_id)
        if not post.have_permission(current_user):
            abort(403, message="Permission denied")
        args = self.put_parse.parse_args()
        for key, value in args.items():
            if key == 'status':
                if value and type(value) == str and value.isdigit():
                    post.__setattr__(key, int(value))
                else:
                    if value:
                        post.__setattr__(key, 1)
                    else:
                        post.__setattr__(key, 0)
            elif value is not None:
                post.__setattr__(key, value)
        if post.status:
            post.now = False
        session.commit()
        return jsonify({"success": "ok", "post_id": post.id, "status": post.status,
                        "tour_id": post.tournament_id, "now": post.now})

    def delete(self, post_id):
        """Deleting a post by id"""
        session = create_session()
        post = session.query(Post).filter(Post.id == post_id).first()
        if not post.have_permission(current_user):
            abort(403)
        if post:
            session.delete(post)
            session.commit()
            return jsonify({"success": "ok"})
        else:
            abort(404, message="Post not found")

    def post(self):
        """Create post"""
        session = create_session()
        args = self.post_parse.parse_args()
        post = Post()
        tour = get_tour(session, args['tournament_id'])
        if not tour.have_permission(current_user):
            abort(403)
        for key, value in args.items():
            if key == 'status':
                if value:
                    post.__setattr__(key, 1)
                    post.now = False
                else:
                    post.__setattr__(key, 0)
                    post.now = True
            else:
                post.__setattr__(key, value)
        post.author_id = current_user.get_id()
        session.add(post)
        session.commit()
        return jsonify({"success": "ok", "post_id": post.id, "status": post.status,
                        "tour_id": post.tournament_id, "now": post.now})


class TournamentPostsResource(Resource):
    get_pars = reqparse.RequestParser()
    get_pars.add_argument('type', type=str, default='visible', location='args')
    get_pars.add_argument('last_id', type=int, help="Не правильно указан last_id", location='args')
    get_pars.add_argument('offset',
                          type=int,
                          help="Не правильно указан offset",
                          default=100,
                          location='args')

    def get(self, tour_id):
        """
        Get existing (status != 0) posts for current tournament
        Request args:
        type 'hidden' - get hidden posts for current tournament
        type 'visible' - get visible posts for current tournament
        type 'all' - get all posts for current tournament
        """
        args = self.get_pars.parse_args()
        logging.info(f"Posts get request: {args}")
        session = create_session()
        tour = get_tour(session, tour_id)
        t = args['type']
        if t in ('hidden', 'all') and not tour.have_permission(current_user):
            abort(403, message="Permission denied")

        query = session.query(Post).filter(Post.tournament_id == tour_id)
        if t != 'all':
            status = 0 if t == 'hidden' else 1
            query = query.filter_by(status=status)

        last_id = args['last_id']
        if last_id is not None:
            created_at = get_post(session, last_id).created_at
            query = query.filter(
                Post.created_at <= created_at, Post.id != last_id)

        query.order_by()

        offset = args['offset']
        posts = query.order_by(Post.created_at.desc()).limit(offset)

        return jsonify({'posts': list(map(to_dict, posts))})
