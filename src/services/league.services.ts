import {League} from "../types/models";
import {LeagueFormData} from "../components";
import axios from "axios";
import {Response} from "./types";

const leagueServices = {
    get: async function(leagueId: number) {
        const {data: r} = await axios.get<Response<{league: League}>>(`/api/league/${leagueId}`);
        return r.league;
    },
    getLeagues: async function(tourId: number) {
        const {data: res} = await axios.get(`/api/league?tournament_id=${tourId}`)
        const {leagues} = res;
        return leagues as League[];
    },
    addLeague: async function(formData: LeagueFormData, tourId: number) {
        const sendData = {
            ...formData,
            tournament_id: tourId,
        }
        const {data: res} = await axios.post<LeagueResponse>(`/api/league`, sendData);
        return res.league;
    },
    editLeague: async function(formData: LeagueFormData, leagueId: number) {
        const sendData = {
            ...formData,
        }
        const {data: res} = await axios.put<LeagueResponse>(`/api/league/${leagueId}`, sendData);
        return res.league;
    },
    deleteLeague: async function(leagueId: number) {
        await axios.delete<Response>(`/api/league/${leagueId}`);
        return;
    },
}


type LeagueResponse = Response<{league: League}>;

export default leagueServices;