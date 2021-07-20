import React, {FC} from "react";
import LoginForm from "../../components/models/User/LoginForm";
import {Link} from "react-router-dom";
import {FormBox} from "../../components";

const LoginScene: FC = () => {
    return (
        <>
            <FormBox size="tiny">
                <FormBox.Title>
                    Вход в аккаунт
                </FormBox.Title>
                <LoginForm className="pt-sm-3"/>
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
            </FormBox>
        </>
    );
}
export default LoginScene;