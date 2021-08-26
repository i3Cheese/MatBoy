from manager import Manager
from data import global_init, get_session, User, Tournament
import datetime as dt

manager = Manager()
global_init()


@manager.command
def give_creator(id=None, email=None):
    session = get_session()
    if id:
        user = session.query(User).get(id)
    elif email:
        user = session.query(User).filter(User.email == email.lower()).first()
    else:
        print("User data is required")
        return
    if not user:
        print("User not found")
        return
    if user.is_creator:
        print(repr(user), "already is creator")
        return
    user.is_creator = True
    session.merge(user)
    session.commit()
    print(repr(user), "now is creator")


@manager.command
def delete_tour(id):
    """Use it if only if user haven't relations"""
    session = get_session()
    tour = session.query(Tournament).get(id)
    if not tour:
        print("Tour not found")
        return
    session.delete(tour)
    session.commit()
    print(repr(tour), "now deleted")


@manager.command
def delete_user(id=None, email=None):
    """Use it if only if user haven't relations"""
    session = get_session()
    if id:
        user = session.query(User).get(id)
    elif email:
        user = session.query(User).filter(User.email == email.lower()).first()
    else:
        print("User data is required")
        return
    if not user:
        print("User not found")
        return
    session.delete(user)
    session.commit()
    print(repr(user), "now deleted")


@manager.command
def make_robots():
    session = get_session()
    names = ['Валентин',
             'Александр',
             "Слава",
             "Егор",
             "Павел",
             "Дарья",
             "Игнат",
             "Даниил",
             "Илья",
             "Джоел",
             "Элли"]
    for i, name in enumerate(names):
        user = User(
            surname='Маск',
            name=name,
            city='Владивосток',
            birthday=dt.date(1970, 1, 1),
            email='robot{0}@facto.ry'.format(i),
        )
        user.set_password('31415926')
        print(repr(user))
        session.add(user)
    session.commit()
