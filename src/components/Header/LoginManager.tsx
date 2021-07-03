import React from "react";
import {FC} from "react";
import {Navbar, Button} from "react-bootstrap";
import {User} from "../../types/models";
import {Link} from "react-router-dom"


const Logged: FC<{user: User}> = ({user}) => {
    return (
        <div className="login_manager">
            <Navbar.Brand
               href={`/profile/${user.id}`}>
                {user.name}
            </Navbar.Brand>
            <Button variant="primary" href="/logout">
                Выйти
            </Button>
        </div>
    );
}

const Logout: FC<{}> = ({}) => {
    return (
        <div className="login_manager">
            <Button variant="success" href="/register">
                Зарегистрироваться
            </Button>
            <Button variant="primary" href="/logout">
                Войти
            </Button>
        </div>
    );
}

const LoginManager: FC<{}> = props => {
    //TODO: DO LOGIN
    return <Logout />;
}

export default LoginManager;
