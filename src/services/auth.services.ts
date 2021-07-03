import {jsonToFormData} from "../helpers";
import {User} from "../types/models";

export const authService = {
    login: function login(form: object) {
        const requestOptions = {
            method: 'POST',
            data: jsonToFormData(form),
        };
        return fetch(`/api/login`, requestOptions)
            .then(r => r.json().then(
                ({success, user, message}: { success: boolean, user?: User, message?: string }) => {
                    if (success) {
                        return user as User;
                    } else {
                        const er = message || r.statusText;
                        return Promise.reject(er);
                    }
                }
            ));
    },

    logout: function () {
        return fetch('/api/logout', {method: 'POST'})
            .then(r => r.json().then(
                (data) => {
                    return data;
                }
            ));
    },
}


function handleResponse(response: Response) {
    return response.text().then(text => {
        const data = text && JSON.parse(text);
        if (!response.ok) {
            if (response.status === 401) {
                location.reload();
            }

            const error = (data && data.message) || response.statusText;
            return Promise.reject(error);
        }

        return data;
    });
}

export default authService;