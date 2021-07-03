import { Action } from 'redux'
import {User} from "../../types/models";

export interface LoginRequestAction extends Action {
    type: "LOGIN_REQUEST",
}

export interface LoginSuccessAction extends Action {
    type: "LOGIN_SUCCESS",
    user: User,
}

export interface LoginFailureAction extends Action {
    type: "LOGIN_FAILURE",
    error: string,
}

export interface LogoutAction extends Action {
    type: "LOGOUT",
}

type AuthAction = LoginRequestAction | LoginSuccessAction | LoginFailureAction | LogoutAction;
export default AuthAction;