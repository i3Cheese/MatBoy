import axios from "axios";
import {Response} from "./types";
import {Game} from "../types/models";
import {GameFormData} from "../components/models/Game/GameForm";

const gameService = {
    getGames: async function (leagueId?: number, teamId?: number) {
        let url = `/api/game?`
        if (leagueId != undefined) {
            url += `league_id=${leagueId}&`
        }
        if (teamId != undefined) {
            url += `team_id=${teamId}&`
        }
        const {data: r} = await axios.get<Response<{games: Game[]}>>(url);
        if (r.success) {
            return r.games;
        } else {
            throw r.message;
        }
    },
    addGame: async function(formData: GameFormData, leagueId: number) {
        const sendData = {
            ...formData,
            league_id: leagueId,
        }
        const {data: res} = await axios.post<Response<{game: Game}>>(`/api/game`, sendData);
        if (res.success) {
            return res.game;
        } else {
            throw res.message;
        }
    },
    editGame: async function(formData: GameFormData, gameId: number) {
        const sendData = {
            ...formData,
        }
        const {data: res} = await axios.put<Response<{game: Game}>>(`/api/game/${gameId}`, sendData);
        if (res.success) {
            return res.game;
        } else {
            throw res.message;
        }
    },
    deleteGame: async function(gameId: number) {
        const {data: res} = await axios.delete<Response>(`/api/game/${gameId}`);
        if (res.success) {
            return;
        } else {
            const er = res.message;
            return Promise.reject(er);
        }
    }
}

export default gameService;