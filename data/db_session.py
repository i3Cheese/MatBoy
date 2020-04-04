import sqlalchemy as sa
import sqlalchemy.orm as orm
from sqlalchemy.orm import Session, scoped_session, sessionmaker
import sqlalchemy.ext.declarative as dec
from sqlalchemy_mixins import AllFeaturesMixin

SqlAlchemyBase = dec.declarative_base()

__factory = None
session = None


class BaseModel(SqlAlchemyBase, AllFeaturesMixin):
    __abstract__ = True
    pass


def global_init(db_file: str) -> None:
    global __factory, session
    if __factory:
        return

    db_file = db_file.strip()
    if not db_file:
        raise Exception("Необходимо указать файл базы данных")

    conn_str = f'sqlite:///{db_file}?check_same_thread=False'
    print(f'Подключение к базе данных по адресу {repr(conn_str)}')

    engine = sa.create_engine(conn_str, echo=False)
    __factory = orm.sessionmaker(bind=engine)

    from . import __all_models

    SqlAlchemyBase.metadata.create_all(engine)
    session = scoped_session(sessionmaker(autocommit=False,
                                          autoflush=False,
                                          bind=engine))
    BaseModel.set_session(session)


def create_session() -> Session:
    global __factory
    return __factory()
