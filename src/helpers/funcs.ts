import {Game, Team} from "../types/models";

export const sortTeams = (teams: Team[]) => [
    ...teams.filter((team) => team.status_string == "waiting"),
    ...teams.filter((team) => team.status_string == "accepted"),
    ...teams.filter((team) => team.status_string == "declined"),
];

export function gameName(game: Game) {
    return `${game.team1.name} — ${game.team2.name}`;
}

export function teamStatus(team: Team) {
    switch (team.status_string) {
        case "accepted":
            return 'Заявка одобрена';
        case "waiting":
            return 'Заявка находится на рассмотрении';
        case 'declined':
        default:
            return 'Заявка отклонена';
    }
}
export function teamStatusColor(team: Team | null) {
    if (team === null) return 'light';
    switch (team.status_string) {
        case "accepted":
            return 'success';
        case "waiting":
            return 'warning';
        case 'declined':
        default:
            return 'danger';
    }
}