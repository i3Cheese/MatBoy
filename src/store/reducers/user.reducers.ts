import {User} from "../../types/models";
import AppAction from "../actionTypes";

export type AuthState = { loggedIn: boolean, user: User | null, isWaiting: boolean }


let user: User | null = JSON.parse(localStorage.getItem('user')!);
const initialState = {user, loggedIn: user === null, isWaiting: false};

export function authReducer(state: AuthState = initialState, action: AppAction): AuthState {
    switch (action.type) {
        case "LOGIN_REQUEST":
            return {
                loggedIn: false,
                user: null,
                isWaiting: false,
            };
        case "LOGIN_SUCCESS":
            return {
                loggedIn: true,
                user: action.user,
                isWaiting: false,
            };
        case "LOGIN_FAILURE":
        case "LOGOUT":
            return {
                user: null,
                loggedIn: false,
                isWaiting: false,
            };
        default:
            return state
    }
}