import logging
from server import app
from data import db_session
from flask import jsonify
import sqlalchemy.exc


logger = logging.getLogger(__name__)


@app.errorhandler(500)
def handle_bad_request(e):
    db_session.rollback()
    logger.error("rollback in 500")
    raise e


@app.teardown_request
def teardown_request(exception):
    if exception:
        logger.error("rollback in teardown")
        db_session.rollback()
