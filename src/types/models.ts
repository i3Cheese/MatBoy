export interface User {
    id: number,
    name: string,
    surname: string,
    patronymic: string,
    fullname: string,
    city: string,
    birthday: Date,
    email?: string,
    is_creator?: boolean,
    link: string,
}

export interface Tournament {
    id: number,
    title: string,
    description: string,
    chief: User,
    place: string,
    start: Date | null,
    end: Date | null,
    edit_access: boolean,
    link?: string,
}

export interface League {
    id: number,
    title: string,
    tournament: Tournament,
    description: string,
    chief: User,
    edit_access: boolean,
    link?: string,
}

export interface Team {
    name: string,
    id: number,
    tournament: Tournament,
    motto: string | null,
    league: League | null,
    status: "declined" | "waiting" | "accepted",
    trainer: User,
    players: User[],
    edit_access: boolean,
}

export interface Game {
    id: number,
    place: string,
    start: Date,
    judge: User,
    league: League,
    team1: Team,
    team2: Team,
}
