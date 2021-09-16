import axios from "axios";
import {Response} from "./types";
import {AccessGroup, Game, User} from "../types/models";
import {GameFormData} from "../components";

export type userData = {email: string} | {id: number}

const agServices = {
    get: async function (agId: number) {
        let url = `/api/access_group/${agId}`
        const {data: r} = await axios.get<Response<{access_group: AccessGroup}>>(url);
        if (r.success) {
            return r.access_group;
        } else {
            throw r.message;
        }
    },
    addMember: async function(agId:number, member: userData) {
        let url = `/api/access_group/${agId}/add`
        const {data: res} = await axios.put<Response<{member: User}>>(url, {member,});
        if (res.success) {
            return res;
        } else {
            throw res.message;
        }
    },
    removeMember: async function(agId:number, member: {id: number}) {
        let url = `/api/access_group/${agId}/remove?member_id=${member.id}`
        const {data: res} = await axios.delete<Response>(url);
        if (res.success) {
            return;
        } else {
            throw res.message;
        }
    },
}

export default agServices;