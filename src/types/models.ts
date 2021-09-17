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
}

export interface AccessGroup {
    id: number,
    full_access: boolean,
    manage_access: boolean,
    members: User[],
}

export interface Tournament {
    id: number,
    title: string,
    description: string,
    chief: User,
    place: string,
    start_time: Date | null,
    end_time: Date | null,
    full_access: boolean,
    manage_access: boolean,
    access_group?: AccessGroup,
}

export interface League {
    id: number,
    title: string,
    tournament: Tournament,
    description: string,
    full_access: boolean,
    manage_access: boolean,
    access_group?: AccessGroup,
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
    full_access: boolean,
    manage_access: boolean,
}

type _GameStatus = {
    status: "deleted" | "created"
} | {
    status: "started",
    started_at: Date,
} | {
    status: "finished",
    started_at: Date,
    finished_at: Date,
}

export type Game = {
    id: number,
    title: string,
    place: string,
    start_time: Date,
    status: "deleted" | "created" | "started" | "finished",
    league: League,
    team1: Team,
    team2: Team,
    protocol: Protocol,
    full_access: boolean,
    manage_access: boolean,
    access_group?: AccessGroup,
} & _GameStatus;


export interface Protocol {
    rounds: Round[],
    captain_task: string | null,
    captain_winner: Team | null,
    team1_data: TeamProtocolData,
    team2_data: TeamProtocolData,
    additional: string,
    updated_at: Date,
}

export interface TeamProtocolData {
    captain: User | null,
    deputy: User | null,
}


export type CallType = 1 | 2 | 3 | 4 | 5 | 6;

export interface Round {
    team1_data: TeamRoundData,
    team2_data: TeamRoundData,
    call_type: CallType,
    problem: number,
    additional: string,
}

export interface TeamRoundData {
    points: number,
    stars: number,
    players: User[],
}
