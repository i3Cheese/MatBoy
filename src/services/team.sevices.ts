import {Team} from "../types/models";
import {Response} from "./types";
import axios from "axios";


const teamServices = {
    get: async function (tourId: number) {
        const {data: res} = await axios.get<Response<{team: Team}>>(`/api/team/${tourId}`);
        return res.team;
    },
    getTeams: async function(tourId?: number, leagueId?: number, userId?: number) {
        let url = "/api/team?";
        if (tourId !== undefined) {
            url += `tournament_id=${tourId}&`;
        }
        if (leagueId!==undefined) {
            url += `league_id=${leagueId}&`;
        }
        if (userId!==undefined) {
            url += `user_id=${userId}&`;
        }
        const {data: res} = await axios.get<Response<{teams: Team[]}>>(url);
        return res.teams as Team[];
    },
    postNew: async function(tourId: number, data: TeamData) {
        const sendData = {...data, tournament_id: tourId};
        const {data: res} = await axios.post<Response<{team: Team}>>(`/api/team`, sendData);
        return res.team;
    },
    acceptTeam: function(teamId: number, leagueId: number) {
        return teamStatusChanger(teamId, {league_id: leagueId, status: "accepted"});
    },
    declineTeam: function(teamId: number) {
        return teamStatusChanger(teamId, {status: "declined"});
    },
    restoreTeam: function(teamId: number) {
        return teamStatusChanger(teamId, {status: "waiting"});
    },

}

async function teamStatusChanger(teamId: number, data: any): Promise<Team> {
    const {data: res} = await axios.put<Response<{team: Team}>>(`/api/team/${teamId}`, data);
    return res.team;
}

export interface TeamData {
    name: string,
    motto?: string,
    players: {email: string}[]
}

export default teamServices;