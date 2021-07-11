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
    get: function get(tourId: number) {
        const requestOptions: RequestInit = {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        }
        return fetch(`/api/tournament/${tourId}`, requestOptions)
            .then(
                r => {
                    return r.text().then(t => {
                        return JSON.parse(t, revive);
                    }).then(
                        ({tournament: tour} : {tournament: Tournament}) => {
                            return tour;
                        }
                    )
                }
            );
    },
    postNew: function postNew(form : ITournamentFormRequest) {
        console.log(form);
        const requestOptions: RequestInit = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({form}),
        }
        return fetch(`/api/tournament`, requestOptions)
            .then(
                r => {
                    return r.text().then(t => {
                        const obg = JSON.parse(t, revive);
                        console.log(obg);
                        return obg;
                    }).then(
                        ({tournament: tour, success, message} : {tournament?: Tournament, success: boolean, message?: string}) => {
                            if (success) {
                                console.log('success')
                                return tour as Tournament;
                            } else {
                                const er = message || r.statusText;
                                return Promise.reject(er);
                            }
                        }
                    )
                }
            );
    }
}

export interface ITournamentFormRequest {
    title: string,
    description: string,
    place: string,
    start: string,
    end: string,
}


export default tournamentService;
