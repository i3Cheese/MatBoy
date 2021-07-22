import React, {ChangeEventHandler, Component, ComponentProps, FC, FormEventHandler} from "react";
import {connect, ConnectedProps} from "react-redux";
import {Button, Form, FormProps} from "react-bootstrap";
import produce from "immer";
import ArgsType = jest.ArgsType;
import {authActions} from "../../../actions";
import {AppDispatch, AppState} from "../../../store";
import {Redirect} from "react-router";
import {FormBox} from "../../layout";
import {Link} from "react-router-dom";


interface LoginState {
    form: {
        email: string,
        password: string,
    }
}

class RawLoginForm extends Component<LoginProps, LoginState> {
    constructor(props: LoginProps) {
        super(props);
        this.state = {
            form: {
                email: '',
                password: '',
            },
        }
    }

    handleSubmit: FormEventHandler = (event) => {
        this.props.login(this.state.form);
        event.preventDefault();
    }

    handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
        this.setState(produce(this.state, draftState => {
            draftState.form[event.target.name as ("email" | "password")] = event.target.value;
        }));
    }

    render() {
        if (this.props.loggedIn) return <Redirect to={'/'}/>;
        return (
            <Form onSubmit={this.handleSubmit} className={this.props.className}>
                <fieldset disabled={this.props.isWaiting}>
                    <Form.Group>
                        <Form.Label>E-mail</Form.Label>
                        <Form.Control
                            name="email"
                            type="email"
                            placeholder="Введите e-mail"
                            onChange={this.handleChange}
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Пароль</Form.Label>
                        <Form.Control
                            name="password"
                            type="password"
                            onChange={this.handleChange}
                            value={this.state.form.password}
                        />
                    </Form.Group>
                    <Button variant="primary" type="submit">Войти</Button>
                </fieldset>
            </Form>
        );
    }
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


export const LoginFormBox: FC<ComponentProps<typeof FormBox> > = ({...props}) => (
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
