import axios from "axios";
import {Response} from "./types";
import {User} from "../types/models";

const userServices = {
    exist: async (email: string) => {
        const {data: {exist}} = await axios.get<{exist: boolean}>(`/api/user?email=${email}`);
        return exist;
    },
    get: async (id: number) => {
        const {data: r} = await axios.get<Response<{user: User}>>(`/api/user/${id}`);
        if (r.success) {
            return r.user;
        } else {
            return Promise.reject(r.message);
        }
    }
}

export default userServices;
