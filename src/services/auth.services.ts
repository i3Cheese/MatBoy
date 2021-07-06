import {User} from "../types/models";
import revive from "../helpers/json/revive";

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
                r => {
                    return r.text().then(t => {
                        return JSON.parse(t, revive)
                    }).then(
                        ({success, user, message}: { success: boolean, user?: User, message?: string }) => {
                            if (success) {
                                console.log(user)
                                return user as User;
                            } else {
                                const er = message || r.statusText;
                                return Promise.reject(er);
                            }
                        }
                    )
                },
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