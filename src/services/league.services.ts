import revive from "../helpers/json/revive";
import {League, Tournament} from "../types/models";
import {URL} from "url";

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
    }
}

export default leagueServices;