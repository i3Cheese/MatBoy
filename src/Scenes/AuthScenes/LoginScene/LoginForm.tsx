import React, {ChangeEventHandler, Component, FormEventHandler} from "react";
import {connect, ConnectedProps} from "react-redux";
import {Button, Form, FormProps} from "react-bootstrap";
import produce from "immer";
import ArgsType = jest.ArgsType;
import {history} from "../../../helpers";
import {authActions} from "../../../actions";
import {AppDispatch, AppState} from "../../../store";


interface LoginState {
    form: {
        email: string,
        password: string,
    }
}

class LoginForm extends Component<LoginProps, LoginState> {
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

    componentDidUpdate(prevProps: Readonly<LoginProps>, prevState: Readonly<LoginState>, snapshot?: any) {
        if (this.props.loggedIn) history.push('/');
    }

    render() {
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


export default connector(LoginForm);