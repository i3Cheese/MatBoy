# import sys
# from flask import Flask
# from flask_restful import Api
# from data import global_init
# from config import config

# app = Flask(__name__)
# api = Api(app)
# for key, value in config.API_CONFIG.items():
#     app.config[key] = value
    
    
# from .resources import UserResource, UsersResource, TeamResource
# api.add_resource(UserResource, '/user/<int:user_id>')
# api.add_resource(UsersResource, '/users')
# api.add_resource(TeamResource, '/team/<int:team_id>')




# def run():
#     global_init()
#     app.run(host=config.HOST, port=config.API_PORT, debug=config.DEBUG)


# if __name__ == "__main__":
#     run()