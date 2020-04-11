from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_migrate import Migrate
from config import app_config

app = Flask(__name__, template_folder="../templates", static_folder="../static")
for key, value in app_config.items():
    app.config[key] = value
db = SQLAlchemy(app)

from .models import User, Team, League, Tournament, Game
db.create_all()

migrate = Migrate()
with app.app_context():
    if db.engine.url.drivername == "sqlite":
        migrate.init_app(app, db, render_as_batch=True)
    else:
        migrate.init_app(app, db)

login_manager = LoginManager()
login_manager.init_app(app)

from . import web_pages
app.register_blueprint(web_pages.blueprint)