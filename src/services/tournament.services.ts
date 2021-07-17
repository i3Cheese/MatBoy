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
    get: async function (tourId: number) {
        const requestOptions: RequestInit = {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        }
        const response = await fetch(`/api/tournament/${tourId}`, requestOptions);
        const {tournament: tour} = await response.text().then(t => JSON.parse(t, revive));
        return tour as Tournament;
    },
    postNew: async function (form : ITournamentFormRequest) {
        console.log(form);
        const requestOptions: RequestInit = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({form}),
        }
        const response = await fetch(`/api/tournament`, requestOptions);
        const data = await response.text().then(t => JSON.parse(t, revive));
        const {tournament: tour, success, message} : {tournament?: Tournament, success: boolean, message?: string} = data;
        if (success) {
            console.log('success')
            return tour as Tournament;
        } else {
            const er = message || response.statusText;
            return Promise.reject(er);
        }
    },
    edit: async function (tourId: number, form : ITournamentFormRequest) {
        const requestOptions: RequestInit = {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({form}),
        }
        const response = await fetch(`/api/tournament/${tourId}`, requestOptions);
        const data = await response.text().then(t => JSON.parse(t, revive));
        const {tournament: tour, success, message} : {tournament?: Tournament, success: boolean, message?: string} = data;
        if (success) {
            return tour as Tournament;
        } else {
            const er = message || response.statusText;
            return Promise.reject(er);
        }
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
