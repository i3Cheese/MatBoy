import {Game, LeagueBasics, TeamBasics, TournamentBasics} from "../types/models";

export function tourLink(tour: TournamentBasics) {
    return `/tournament/${tour.id}`;
}

export function leagueLink(league: LeagueBasics) {
    return `${tourLink(league.tournament)}/league/${league.id}`;
}

export function teamLink(team: TeamBasics) {
    return `${tourLink(team.tournament)}/team/${team.id}`;
}

export function gameLink(game: Game) {
    return `${leagueLink(game.league)}/game/${game.id}`
}