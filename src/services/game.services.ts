import axios from "axios";
import {Response} from "./types";
import {Game} from "../types/models";
import {LeagueFormData} from "../components/models/League/LeagueForm";
import {GameFormData} from "../components/models/Game/GameForm";

const gameService = {
    getLeagueGames: async function (leagueId: number) {
        const {data: r} = await axios.get<Response<{games: Game[]}>>(`/api/game?league_id=${leagueId}`);
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
}

export default gameService;