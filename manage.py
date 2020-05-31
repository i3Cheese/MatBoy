from manager import Manager
from data import global_init, create_session, User
from config import config
from pprint import pprint
import requests

manager = Manager()
global_init()


@manager.command
def give_creator(id=None, email=None):
    session = create_session()
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
def make_robots():
    for i in range(10):
        res = requests.post(config.APP_URL + "api/user",
                            json={"surname": f"Иванов",
                                  "name": f"Робот{i}",
                                  "city": "Москва",
                                  "birthday": "12.12.2012",
                                  "password": f"31415926",
                                  "email": f"robot{i}@factory.com"
                                  })
        pprint(res)
