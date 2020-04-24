from manager import Manager
from data import global_init, create_session, User

manager = Manager()
global_init()


@manager.command
def give_creator(id=None, email=None):
    session = create_session()
    if id:
        user = session.query(User).get(id)
    elif email:
        user = session.query(User).filter(User.email == email)
    else:
        print("User data is required")
        return
    if not user:
        print("User not found")
    if user.is_creator:
        print(repr(user), "already is creator")
        return
    user.is_creator = True
    session.merge(user)
    session.commit()
    print(repr(user), "now is creator")