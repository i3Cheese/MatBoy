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
        if (r.success) {
            return r.games;
        } else {
            throw r.message;
        }
    },
    get: async function (gameId: number) {
        let url = `/api/game/${gameId}`
        const {data: r} = await axios.get<Response<{game: Game}>>(url);
        if (r.success) {
            return r.game;
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
    },
    editProtocol: async function(formData: any, gameId: number) {
        const sendData = {
            ...formData,
        }
        const {data: res} = await axios.put<Response<{game: Game}>>(`/api/game/${gameId}/protocol`, sendData);
        if (res.success) {
            return res.game;
        } else {
            throw res.message;
        }
    },
    startGame: function(gameId: number) {
        return gameStatusChanger(gameId, {status: "started"});
    },
    finishGame: function(gameId: number) {
        return gameStatusChanger(gameId, {status: "finished"});
    },
    restoreGame: function(gameId: number) {
        return gameStatusChanger(gameId, {status: "created"});
    },
}

async function gameStatusChanger(gameId: number, data: any): Promise<Game> {
    const {data: res} = await axios.put<Response<{game:Game}>>(`/api/game/${gameId}/status`, data);
    if (res.success) {
        return res.game;
    } else {
        const er = res.message;
        return Promise.reject(er);
    }
}


export default gameServices;