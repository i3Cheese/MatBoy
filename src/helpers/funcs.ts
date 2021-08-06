import {Game, Team} from "../types/models";

export const sortTeams = (teams: Team[]) => [
    ...teams.filter((team) => team.status_string == "waiting"),
    ...teams.filter((team) => team.status_string == "accepted"),
    ...teams.filter((team) => team.status_string == "declined"),
];

export function gameName(game: Game) {
    return `${game.team1.name} — ${game.team2.name}`;
}