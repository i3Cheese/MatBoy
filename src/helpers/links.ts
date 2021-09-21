import {Game, League, PostBasics, Team, TournamentBasics, User} from "../types/models";


export function userLink(user: User) {
    return `/profile/${user.id}`;
}

export function tourLink(tour: TournamentBasics) {
    return `/tournament/${tour.id}`;
}

export function postLink(post: PostBasics) {
    return `${tourLink(post.tournament)}/post/${post.id}`;
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

export function makeAbsoluteUrl(relativeUrl: string) {
    return `${location.protocol || "http:"}//${location.host}${relativeUrl}`;
}