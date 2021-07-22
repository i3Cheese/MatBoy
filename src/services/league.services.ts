import revive from "../helpers/json/revive";
import {League} from "../types/models";
import {LeagueFormData} from "../components/models/League/LeagueForm";
import axios from "axios";
import {Response} from "./types";

const leagueServices = {
    getLeagues: async function(tourId: number) {
        const requestOptions: RequestInit = {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        }
        const response = await fetch(`/api/league?tournament_id=${tourId}`, requestOptions);
        const {leagues} = await response.text().then(t => JSON.parse(t, revive));
        console.log(leagues);
        return leagues as League[];
    },
    addLeague: async function(formData: LeagueFormData, tourId: number) {
        const sendData = {
            ...formData,
            tournament_id: tourId,
        }
        const {data: res} = await axios.post<LeagueResponse>(`/api/league`, sendData);
        if (res.success) {
            return res.league;
        } else {
            const er = res.message;
            return Promise.reject(er);
        }
    },
    changeLeague: async function(formData: LeagueFormData, leagueId: number) {
        const sendData = {
            ...formData,
        }
        const {data: res} = await axios.put<LeagueResponse>(`/api/league/${leagueId}`, sendData);
        if (res.success) {
            return res.league;
        } else {
            const er = res.message;
            return Promise.reject(er);
        }
    },
    deleteLeague: async function(leagueId: number) {
        const {data: res} = await axios.delete<Response>(`/api/league/${leagueId}`);
        if (res.success) {
            return;
        } else {
            const er = res.message;
            return Promise.reject(er);
        }
    },
}


type LeagueResponse = Response<{league: League}>;

export default leagueServices;