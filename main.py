from app import login_manager, app, User
import config


def main():
    app.run(debug=config.DEBUG)


@login_manager.user_loader
def load_user(user_id) -> User:
    return User.query.get(user_id)
        

if __name__ == "__main__":
    main()