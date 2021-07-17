from server import app
from flask_restful import Api

api = Api(app)

import server.api.resources
from server.api.resources import UserResource, UsersResource, TeamResource, LeagueResource
from server.api.resources import GameResource, GamesResource, ProtocolResource
from server.api.resources import PostResource, TournamentPostsResource


api.add_resource(UserResource, '/user/<int:user_id>')
api.add_resource(UsersResource, '/user')
api.add_resource(TeamResource, '/team/<int:team_id>')
api.add_resource(LeagueResource, '/league/<int:league_id>')
api.add_resource(GameResource, '/game/<int:game_id>')
api.add_resource(GamesResource, '/game')
api.add_resource(ProtocolResource, '/game/<int:game_id>/protocol')
api.add_resource(PostResource, '/post', '/post/<int:post_id>')
api.add_resource(TournamentPostsResource, '/tournament/<int:tour_id>/posts')