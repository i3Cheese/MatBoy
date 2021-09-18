import axios from "axios";
import {Response} from "./types";
import {AccessGroup, User} from "../types/models";

export type userData = {email: string} | {id: number}

const agServices = {
    get: async function (agId: number) {
        let url = `/api/access_group/${agId}`
        const {data: r} = await axios.get<Response<{access_group: AccessGroup}>>(url);
        return r.access_group;
    },
    addMember: async function(agId:number, member: userData) {
        let url = `/api/access_group/${agId}/add`
        const {data: res} = await axios.put<Response<{member: User}>>(url, {member,});
        return res;
    },
    removeMember: async function(agId:number, member: {id: number}) {
        let url = `/api/access_group/${agId}/remove?member_id=${member.id}`
        await axios.delete<Response>(url);
        return;
    },
}

export default agServices;