import {Tournament} from "../types/models";
import revive from "../helpers/json/revive";


export const tournamentService = {
    getAll: function getAll() {
        const requestOptions: RequestInit = {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        };
        return fetch(`/api/tournament`, requestOptions)
            .then(
                r => {
                    return r.text().then(t => {
                        return JSON.parse(t, revive)
                    }).then(
                        ({success, tournaments, message}: { success: boolean, tournaments: Tournament[], message?: string}) => {
                            if (success) {
                                return tournaments;
                            } else {
                                const er = message || r.statusText;
                                return Promise.reject(er);
                            }
                        }
                    )
                },
                r => r.json().then(({message}: { message?: string }) => {
                    const er = message || r.statusText;
                    return Promise.reject(er);
                })
            )
    },
}

export default tournamentService;
