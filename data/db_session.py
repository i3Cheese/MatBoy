import sqlalchemy as sa
import sqlalchemy.orm as orm
from sqlalchemy.orm import Session, scoped_session, sessionmaker
import sqlalchemy.ext.declarative as dec
from sqlalchemy_mixins import ReprMixin, SerializeMixin, TimestampsMixin

SqlAlchemyBase = dec.declarative_base()

__factory = None


class BaseModel(SqlAlchemyBase, ReprMixin, SerializeMixin, TimestampsMixin):
    __abstract__ = True
    
    def fill(self, **kwargs):
        for name in kwargs.keys():
            setattr(self, name, kwargs[name])
        return self


def global_init(db_file: str) -> None:
    global __factory
    if __factory:
        return

    db_file = db_file.strip()
    if not db_file:
        raise Exception("Необходимо указать файл базы данных")

    conn_str = f'sqlite:///{db_file}?check_same_thread=False'
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
