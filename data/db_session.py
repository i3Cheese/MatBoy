import sqlalchemy as sa
import sqlalchemy.orm as orm
from sqlalchemy.orm import Session
import sqlalchemy.ext.declarative as dec
from sqlalchemy_mixins import ReprMixin, SerializeMixin, TimestampsMixin
from config import config

SqlAlchemyBase = dec.declarative_base()

__factory = None


class BaseModel(SqlAlchemyBase, ReprMixin, SerializeMixin, TimestampsMixin):
    __abstract__ = True
    
    def fill(self, **kwargs):
        for name in kwargs.keys():
            setattr(self, name, kwargs[name])
        return self


def global_init() -> None:
    global __factory
    if __factory:
        return

    conn_str = config.DATA_BASE_URL
    if not conn_str:
        raise Exception("Необходимо указать файл базы данных")
    print(f'Подключение к базе данных по адресу {repr(conn_str)}')

    engine = sa.create_engine(conn_str, echo=False)
    __factory = orm.sessionmaker(autocommit=False,
                                 autoflush=False, 
                                 bind=engine)

    from . import __all_models

    SqlAlchemyBase.metadata.create_all(engine)


def create_session() -> Session:
    global __factory
    return __factory()
