from app import app
from flask_restful import Api

api = Api(app)

import app.api.resources
from app.api.resources import TournamentResource
from app.api.resources import UserResource, UsersResource, TeamResource, LeagueResource, LeaguesResource
from app.api.resources import GameResource, GamesResource, ProtocolResource
from app.api.resources import PostResource, TournamentPostsResource


api.add_resource(UserResource, '/api/user/<int:user_id>')
api.add_resource(UsersResource, '/api/user')
api.add_resource(TournamentResource, '/api/tournament/<int:tour_id>')
api.add_resource(TeamResource, '/api/team/<int:team_id>')
api.add_resource(LeagueResource, '/api/league/<int:league_id>')
api.add_resource(LeaguesResource, '/api/league')
api.add_resource(GameResource, '/api/game/<int:game_id>')
api.add_resource(GamesResource, '/api/game')
api.add_resource(ProtocolResource, '/api/game/<int:game_id>/protocol')
api.add_resource(PostResource, '/api/post', '/api/post/<int:post_id>')
api.add_resource(TournamentPostsResource, '/api/tournament/<int:tour_id>/posts')