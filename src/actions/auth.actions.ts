import {authService} from '../services';
import {Dispatch} from "redux";
import {AppAction, AppDispatch} from '../store'
import {User} from "../types/models";

export const authActions = {
    login,
    logout,
    // register,
    getCurrentUser,
};


function login(form: { email: string, password: string, }) {
    return (dispatch: AppDispatch) => {
        dispatch(request());

        authService.login(form)
            .then(
                (user: User) => {
                    console.log(user);
                    dispatch(success(user));
                },
                (error: string) => {
                    console.log(error);
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
        authService.logout().then(() => {
            dispatch(success());
        });
    }

    function success(): AppAction {
        return {type: "LOGOUT"}
    }
}

function getCurrentUser() {
    return (dispatch: AppDispatch) => {
        dispatch(request());
        authService.getCurrentUser().then((data) => {
           if (data.loggedIn) dispatch(setLogged(data.user));
           else dispatch(setLogout());
        });
    }

    function request(): AppAction {
        return {type: "LOGIN_REQUEST"}
    }
    function setLogged(user: User): AppAction {
        return {type: "LOGIN_SUCCESS", user};
    }

    function setLogout(): AppAction {
        return {type: "LOGOUT"};
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
