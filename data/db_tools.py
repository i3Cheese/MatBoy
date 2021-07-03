import sqlalchemy as sa
import sqlalchemy.orm as orm
from sqlalchemy.orm import Session, scoped_session
import sqlalchemy.ext.declarative as dec
from config import config
import logging

SqlAlchemyBase = dec.declarative_base()

__factory: orm.sessionmaker = None
db_session: scoped_session = None
session: Session = None


def global_init() -> None:
    """Connect to the database. If it already done - do nothing"""
    global __factory, db_session, session
    if __factory:
        return

    conn_str = config.DATA_BASE_URL
    logging.info(f'Подключение к базе данных по адресу {repr(conn_str)}')

    engine = sa.create_engine(conn_str, echo=False)
    __factory = orm.sessionmaker(autocommit=False,
                                 autoflush=False,
                                 bind=engine)
    db_session = scoped_session(__factory)
    session = Session(__factory)

    from . import __all_models

    SqlAlchemyBase.metadata.create_all(engine)


def get_session() -> Session:
    """Create the data base session. Previosly global_init() should be call. Deprecated."""
    return session
