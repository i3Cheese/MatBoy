import {User} from "../types/models";
import revive from "../helpers/json/revive";
import {UserDataFormData} from "../components/models/User";

export const authService = {
    login: function login(form: object) {
        const requestOptions: RequestInit = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({form}),
        };
        return fetch(`/api/login`, requestOptions)
            .then(
                r => r.text().then(t => JSON.parse(t, revive)).then(
                    ({success, user, message}: { success: boolean, user?: User, message?: string }) => {
                        if (success) {
                            return user as User;
                        } else {
                            const er = message || r.statusText;
                            return Promise.reject(er);
                        }
                    }
                )
                ,
                r => r.json().then(({message}: { message?: string }) => {
                    const er = message || r.statusText;
                    return Promise.reject(er);
                })
            )
    },

    registration: function (data: UserDataFormData) {
        const requestOptions: RequestInit = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
        };
        return fetch(`/api/registration`, requestOptions)
            .then(
                r => r.text().then(t => JSON.parse(t, revive)).then(
                    ({success, user, message}: { success: boolean, user?: User, message?: string }) => {
                        if (success) {
                            return user as User;
                        } else {
                            const er = message || r.statusText;
                            return Promise.reject(er);
                        }
                    }
                )
                ,
                r => r.json().then(({message}: { message?: string }) => {
                    const er = message || r.statusText;
                    return Promise.reject(er);
                })
            )
    },
    logout: function () {
        return fetch('/api/logout', {method: 'POST'})
            .then(r => r.json().then(
                (data) => {
                    window.location.reload();
                    return data;
                }
            ));
    },

    getCurrentUser: function () {
        return fetch('/api/current_user', {method: 'GET'})
            .then(r => r.json().then(
                (data) => {
                    return data;
                }
            ));
    }
}

export default authService;