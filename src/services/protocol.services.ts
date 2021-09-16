import axios from "axios";
import {Response} from "./types";
import {Game} from "../types/models";

const protocolServices = {
    edit: async function(formData: any, gameId: number) {
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
}

export default protocolServices;