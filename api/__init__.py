import sys
from flask import Flask
from flask_restful import Api
from data import global_init
from config import config

app = Flask(__name__)
api = Api(app)
for key, value in config.API_CONFIG.items():
    app.config[key] = value
    
    
from .user_resource import UserResource, UsersResource
api.add_resource(UserResource, '/user')
api.add_resource(UsersResource, '/users')


def run():
    global_init()
    app.run(host=config.HOST, port=config.API_PORT, debug=config.DEBUG)


if __name__ == "__main__":
    run()