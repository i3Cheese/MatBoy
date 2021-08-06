export interface User {
    id: number,
    name: string,
    surname: string,
    patronymic: string,
    fullname: string,
    city: string,
    birthday: string,
    email?: string,
    is_creator?: boolean,
    link: string,
}

export interface TournamentBasics {
    id: number,
    title: string,
}

export interface Tournament extends TournamentBasics{
    description: string,
    chief: User,
    place: string,
    start: Date | null,
    end: Date | null,
    edit_access: boolean,
    link?: string,
}

export interface LeagueBasics {
    id: number,
    title: string,
    tournament: TournamentBasics,
}

export interface League extends LeagueBasics {
    description: string,
    chief: User,
    edit_access: boolean,
    teams: TeamBasics[],
    link?: string,
}

export interface TeamBasics {
    name: string,
    id: number,
    tournament: TournamentBasics,
}

export interface Team extends TeamBasics {
    motto: string | null,
    league: LeagueBasics | null,
    status_string: "declined" | "waiting" | "accepted",
    trainer: User,
    players: User[],
    edit_access: boolean,
}

export interface Game {
    id: number,
    place: string,
    start: Date,
    judge: User,
    league: LeagueBasics,
    team1: TeamBasics,
    team2: TeamBasics,
}
