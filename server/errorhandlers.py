from server import app
from data import db_session
from flask import jsonify
import sqlalchemy.exc


@app.errorhandler(500)
def handle_bad_request(e):
    db_session.rollback()
    print("x")
    raise e
