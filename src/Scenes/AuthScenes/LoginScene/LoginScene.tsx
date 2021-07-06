import React, {FC} from "react";
import LoginForm from "./LoginForm";
import {Link} from "react-router-dom";

const LoginScene: FC = () => {
    return (
        <>
            <div className="shadow_box">
                <div className="box_title">
                    Вход в аккаунт
                </div>
                <LoginForm className="pt-sm-3"/>
            </div>
            <div className="shadow_box shadow_box-additions">
                Передумали?&nbsp;
                <Link to="/" className="form-additional-message__link">
                    На главную
                </Link>
                <br/>
                Ещё нет аккаунта?&nbsp;
                <Link to="/registration" className="form-additional-message__link">
                    Зарегистрируйтесь
                </Link>
                <br/>
                Забыли пароль?&nbsp;
                <Link to="/reset_password" className="form-additional-message__link">
                    {/*TODO: reset_password*/}
                    Восстановить
                </Link>
            </div>
        </>
    );
}
export default LoginScene;