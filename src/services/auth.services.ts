import {User} from "../types/models";
import {UserDataFormData} from "../components";
import axios from "axios";

export const authService = {
    login: async function login(form: object) {
        const {data: res} = await axios.post<{ success: boolean, user?: User, message?: string }>(`/api/login`, {form});
        const {success, user, message} = res;
        if (success) {
            return user as User;
        } else {
            return Promise.reject(message);
        }
    },
    registration: async function (data: UserDataFormData) {
        const {
            data: {
                success,
                user,
                message
            }
        } = await axios.post<{ success: boolean, user?: User, message?: string }>(`/api/registration`, data)
        if (success) {
            return user as User;
        } else {
            return Promise.reject(message);
        }
    },
    logout: function () {
        return axios.post('/api/logout').then(
            ({data}) => {
                window.location.reload();
                return data;
            }
        )
    },
    getCurrentUser: function () {
        return axios.get('/api/current_user',).then(
            ({data}) => {
                return data;
            }
        );
    },
}

export default authService;
