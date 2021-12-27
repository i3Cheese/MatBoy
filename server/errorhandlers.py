from server import app
from data import db_session
from flask import jsonify
import sqlalchemy.exc


@app.errorhandler(sqlalchemy.exc.SQLAlchemyError)
def handle_bad_request(e):
    db_session.rollback()
    raise e
