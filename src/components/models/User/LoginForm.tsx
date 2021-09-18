import React, {ComponentProps, FC, useCallback} from "react";
import {connect, ConnectedProps} from "react-redux";
import {Button, Form, FormProps} from "react-bootstrap";
import ArgsType = jest.ArgsType;
import {authActions} from "../../../actions";
import {AppDispatch, AppState} from "../../../store";
import {Redirect} from "react-router";
import {FormBox} from "../../layout";
import {Link} from "react-router-dom";
import FormInput from "../../FormInput";
import * as Yup from "yup";
import {useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import {LoginError} from "../../../types/errors";


interface LoginFormInputs {
    email: string,
    password: string,
}

const RawLoginForm: FC<LoginProps> = (props) => {
    const validationSchema = Yup.object().shape({
        email: Yup.string().required().email(),
        password: Yup.string().required(),
    });
    const {register, handleSubmit, formState: {errors}, setError} = useForm<LoginFormInputs>({
        resolver: yupResolver(validationSchema),
    });

    const login = useCallback((data: LoginFormInputs) => {
        props.login(data).catch(
            (e: LoginError | Error) => {
                if ('errors' in e) {
                    if (e.errors.email)
                        setError('email', {
                            type: e.errors.email,
                            message: 'Пользователь с таким e-mail не зарегестрирован'
                        });
                    if (e.errors.password)
                        setError('password', {
                            type: e.errors.password,
                            message: 'Неправильный пароль',
                        });
                }
            });
    }, [props.login]);

    if (props.loggedIn) return <Redirect to={'/'}/>;
    return (
        <Form onSubmit={handleSubmit(login)} className={props.className}>
            <FormBox.Group>
                <FormBox.Item>
                    <fieldset disabled={props.isWaiting}>
                        <FormInput
                            className={"mb-3"}
                            label={"E-mail"}
                            type="email"
                            {...register("email")}
                            error={errors.email}
                        />
                        <FormInput
                            label={"Пароль"}
                            type="password"
                            {...register("password")}
                            error={errors.password}
                        />
                    </fieldset>
                </FormBox.Item>
                <FormBox.Item>
                    <Button variant="primary" type="submit">
                        Подтвердить
                    </Button>
                </FormBox.Item>
            </FormBox.Group>
        </Form>
    );
}

function mapStateToProps(state: AppState) {
    return {
        loggedIn: state.auth.loggedIn,
        user: state.auth.user,
        isWaiting: state.auth.isWaiting,
    }
}

function mapDispatchToProps(dispatch: AppDispatch) {
    return {
        login: (...args: ArgsType<typeof authActions.login>) => authActions.login(...args)(dispatch),
    }
}

const connector = connect(mapStateToProps, mapDispatchToProps);
type LoginProps = ConnectedProps<typeof connector> & FormProps;
export const LoginForm = connector(RawLoginForm);


export const LoginFormBox: FC<ComponentProps<typeof FormBox>> = ({...props}) => (
    <FormBox size="middle" {...props}>
        <FormBox.Title>
            Вход
        </FormBox.Title>
        <LoginForm/>
        <FormBox.Additions>
            <FormBox.Item>
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
            </FormBox.Item>
        </FormBox.Additions>
    </FormBox>
);
