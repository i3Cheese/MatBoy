import {authService} from '../services';
import {AppAction, AppDispatch} from '../store'
import {User} from "../types/models";
import {UserDataFormData} from "../components";

export const authActions = {
    login,
    logout,
    registration,
    getCurrentUser,
};


function login(form: { email: string, password: string, }) {
    return (dispatch: AppDispatch) => {
        dispatch(request());

        return authService.login(form)
            .then(
                (user: User) => {
                    dispatch(success(user));
                },
                (error: string) => {
                    dispatch(failure(error));
                    // dispatch(alertActions.error(error));
                    throw error;
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

function registration(data: UserDataFormData) {
    return (dispatch: AppDispatch) => {
        dispatch(request());

        return authService.registration(data)
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
    return (dispatch: AppDispatch) => {
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
