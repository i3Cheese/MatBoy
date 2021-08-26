import revive from "../helpers/json/revive";
import {Team} from "../types/models";
import {ErrorResponse} from "./types";
import axios from "axios";


const teamServices = {
    get: async function (tourId: number) {
        const requestOptions: RequestInit = {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        }
        const response = await fetch(`/api/team/${tourId}`, requestOptions);
        const {team} = await response.text().then(t => JSON.parse(t, revive));
        return team as Team;
    },
    getTeams: async function(tourId?: number, leagueId?: number, userId?: number) {
        const requestOptions: RequestInit = {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        }
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
        const response = await fetch(url, requestOptions);
        const {teams} = await response.text().then(t => JSON.parse(t, revive));
        return teams as Team[];
    },
    postNew: async function(tourId: number, data: TeamData) {
        const sendData = {...data, tournament_id: tourId};
        const requestOptions: RequestInit = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(sendData),
        }
        const response = await fetch(`/api/team`, requestOptions);
        const res: FullTeamResponse = await response.text().then(t => JSON.parse(t, revive));
        console.log(res)
        if (res.success) {
            return res.team;
        } else {
            const er = res.message || response.statusText;
            return Promise.reject(er);
        }
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
    const {data: res} = await axios.put<FullTeamResponse>(`/api/team/${teamId}`, data);
    if (res.success) {
        return res.team;
    } else {
        const er = res.message;
        return Promise.reject(er);
    }
}

export interface TeamData {
    name: string,
    motto?: string,
    players: {email: string}[]
}

interface TeamResponse {
    success: true,
    team: Team,
}
type FullTeamResponse = TeamResponse | ErrorResponse;

export default teamServices;