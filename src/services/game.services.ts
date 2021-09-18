import axios from "axios";
import {Response} from "./types";
import {Game} from "../types/models";
import {GameFormData} from "../components";

const gameServices = {
    getGames: async function (leagueId?: number, gameId?: number) {
        let url = `/api/game?`
        if (leagueId != undefined) {
            url += `league_id=${leagueId}&`
        }
        if (gameId != undefined) {
            url += `team_id=${gameId}&`
        }
        const {data: r} = await axios.get<Response<{games: Game[]}>>(url);
        return r.games;
    },
    get: async function (gameId: number) {
        let url = `/api/game/${gameId}`
        const {data: r} = await axios.get<Response<{game: Game}>>(url);
        return r.game;
    },
    addGame: async function(formData: GameFormData, leagueId: number) {
        const sendData = {
            ...formData,
            league_id: leagueId,
        }
        const {data: res} = await axios.post<Response<{game: Game}>>(`/api/game`, sendData);
        return res.game;
    },
    editGame: async function(formData: GameFormData, gameId: number) {
        const sendData = {
            ...formData,
        }
        const {data: res} = await axios.put<Response<{game: Game}>>(`/api/game/${gameId}`, sendData);
        return res.game;
    },
    deleteGame: async function(gameId: number) {
        await axios.delete<Response>(`/api/game/${gameId}`);
    },
    editProtocol: async function(formData: any, gameId: number) {
        const sendData = {
            ...formData,
        }
        const {data: res} = await axios.put<Response<{game: Game}>>(`/api/game/${gameId}/protocol`, sendData);
        return res.game;
    },
    startGame: function(gameId: number) {
        return gameStatusChanger(gameId, {action: "start"});
    },
    finishGame: function(gameId: number) {
        return gameStatusChanger(gameId, {action: "finish"});
    },
    restoreGame: function(gameId: number) {
        return gameStatusChanger(gameId, {action: "restore"});
    },
}

async function gameStatusChanger(gameId: number, data: any): Promise<Game> {
    const {data: res} = await axios.put<Response<{game:Game}>>(`/api/game/${gameId}/status`, data);
    return res.game;
}


export default gameServices;