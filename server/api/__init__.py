from server import app
from flask_restful import Api

api = Api(app)

import server.api.resources
