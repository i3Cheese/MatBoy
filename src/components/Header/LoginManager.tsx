import React from "react";
import {FC} from "react";
import {Navbar, Button} from "react-bootstrap";
import {User} from "../../types/models";
import {Link} from "react-router-dom"

import './LoginManager.scss'
import {connect, useSelector} from "react-redux";
import {RootState} from "../../store";
import {authActions} from "../../actions";
import ArgsType = jest.ArgsType;


const Logged = connect(null, (dispatch => {
    return {
        logout: (...args: ArgsType<typeof authActions.logout>) => authActions.logout(...args)(dispatch),
    }
}))(({user, logout}: { user: User, logout: () => void }) => {
    return (
        <div className="login_manager">
            <Navbar.Brand
                href={`/profile/${user.id}`}>
                {user.name}
            </Navbar.Brand>
            <Button variant="primary" onClick={logout}>
                Выйти
            </Button>
        </div>
    );
});


const Logout: FC<{}> = ({}) => {
    return (
        <div className="login_manager">
            <Link className="btn btn-success" to="/register">
                Зарегистрироваться
            </Link>
            <Link className="btn btn-primary" to="/login" role="button">
                Войти
            </Link>
        </div>
    );
}

const LoginManager: FC = () => {
    const auth = useSelector<RootState, RootState["auth"]>((state) => state.auth);

    if (auth.loggedIn && auth.user !== null)
        return <Logged user={auth.user}/>;
    else
        return <Logout/>;
}

export default LoginManager;
