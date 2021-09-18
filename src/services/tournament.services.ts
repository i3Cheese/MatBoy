import {Tournament} from "../types/models";
import {Response} from "./types";
import axios from "axios";


export const tournamentServices = {
    getAll: async function getAll() {
        const {data: res} = await axios.get<Response<{tournaments: Tournament[]}>>(`/api/tournament`)
        return res.tournaments
    },
    get: async function (tourId: number) {
        const {data: res} = await axios.get<Response<TournamentResponse>>(`/api/tournament/${tourId}`);
        return res.tournament;
    },
    postNew: async function (form : ITournamentFormRequest) {
        console.log(form);
        const {data: res} = await axios.post<Response<TournamentResponse>>(`/api/tournament`, {form});
        return res.tournament;
    },
    edit: async function (tourId: number, form : ITournamentFormRequest) {
        const {data: res} = await axios.put<Response<TournamentResponse>>(`/api/tournament/${tourId}`, {form});
        return res.tournament;
    }
}

interface TournamentResponse {
    tournament: Tournament,
}

export interface ITournamentFormRequest {
    title: string,
    description: string,
    place: string,
    start_time: string,
    end_time: string,
}


export default tournamentServices;
