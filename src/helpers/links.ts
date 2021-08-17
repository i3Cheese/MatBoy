import {Game, League, Team, Tournament, User} from "../types/models";


export function userLink(user: User) {
    return `/profile/${user.id}`;
}

export function tourLink(tour: Tournament) {
    return `/tournament/${tour.id}`;
}

export function leagueLink(league: League) {
    return `${tourLink(league.tournament)}/league/${league.id}`;
}

export function teamLink(team: Team) {
    return `${tourLink(team.tournament)}/team/${team.id}`;
}

export function gameLink(game: Game) {
    return `${leagueLink(game.league)}/game/${game.id}`
}