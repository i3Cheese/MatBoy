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
    id: string,
    title: string,
}

export interface League extends LeagueBasics {
    description: string,
    chief: User,
    tournament: TournamentBasics,
    edit_access: boolean,
    link?: string,
}
