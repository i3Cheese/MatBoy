import {authService} from '../services';
// import { alertActions } from './';
import {history} from '../helpers';
import {Dispatch} from "redux";
import {AppAction} from '../store'
import {User} from "../types/models";

export const authActions = {
    login,
    logout,
    // register,
};


function login(form: { email: string, password: string, csrf_token: string }) {
    return (dispatch: Dispatch) => {
        dispatch(request());

        authService.login(form)
            .then(
                (user: User) => {
                    dispatch(success(user));
                    history.push('/');
                },
                (error: string) => {
                    dispatch(failure(error));
                    // dispatch(alertActions.error(error));
                }
            );
    };

    function request(): AppAction {
        return {type: "LOGIN_REQUEST"}
    }

    function success(user: User): AppAction {
        return {type: "LOGIN_SUCCESS", user}
    }

    function failure(error: string): AppAction {
        return {type: "LOGIN_FAILURE", error}
    }
}

function logout() {
    return (dispatch: Dispatch) => {
        authService.logout().then((data) => {
            dispatch(success());
        });
    }
    function success(): AppAction {
        return {type: "LOGOUT"}
    }
}

//
// function register(user) {
//     return dispatch => {
//         dispatch(request(user));
//
//         userService.register(user)
//             .then(
//                 user => {
//                     dispatch(success());
//                     history.push('/login');
//                     dispatch(alertActions.success('Registration successful'));
//                 },
//                 error => {
//                     dispatch(failure(error));
//                     dispatch(alertActions.error(error));
//                 }
//             );
//     };
//
//     function request(user) { return { type: userConstants.REGISTER_REQUEST, user } }
//     function success(user) { return { type: userConstants.REGISTER_SUCCESS, user } }
//     function failure(error) { return { type: userConstants.REGISTER_FAILURE, error } }
// }
