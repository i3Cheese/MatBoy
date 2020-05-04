import sqlalchemy as sa
import sqlalchemy.orm as orm
from sqlalchemy.orm import Session
import sqlalchemy.ext.declarative as dec
from sqlalchemy_mixins import ReprMixin, TimestampsMixin
from sqlalchemy_serializer import SerializerMixin
from config import config
import logging

SqlAlchemyBase = dec.declarative_base()

__factory = None


class BaseModel(SqlAlchemyBase, ReprMixin, SerializerMixin, TimestampsMixin):
    __abstract__ = True
    
    short_serialize_only = ('id',)
    
    id = sa.Column(sa.Integer, primary_key=True, autoincrement=True)
    
    def fill(self, **kwargs):
        """Set the attibutes. Equal to self.key = value.
        It's raise AttributeError if key isn't class attribute"""
        for name in kwargs.keys():
            setattr(self, name, kwargs[name])
        return self
    
    def __eq__(self, other):
        if other is None:
            return False
        elif type(self) == type(other):
            return self.id == other.id
        else:
            raise TypeError
    
    def __hash__(self):
        return hash(self.id)
    
    def to_short_dict(self):
       return self.to_dict(only=self.short_serialize_only)


def global_init() -> None:
    """Connect to the database. If it alredy done - do nothong"""
    global __factory
    if __factory:
        return

    conn_str = config.DATA_BASE_URL
    
    logging.info(f'Подключение к базе данных по адресу {repr(conn_str)}')

    engine = sa.create_engine(conn_str, echo=False)
    __factory = orm.sessionmaker(autocommit=False,
                                 autoflush=False, 
                                 bind=engine)

    from . import __all_models

    SqlAlchemyBase.metadata.create_all(engine)


def create_session() -> Session:
    """Create the data base session. Previosly global_init() should be call"""
    global __factory
    return __factory()
