import {CallType, Game, Team} from "../types/models";

export const sortTeams = (teams: Team[]) => [
    ...teams.filter((team) => team.status == "waiting"),
    ...teams.filter((team) => team.status == "accepted"),
    ...teams.filter((team) => team.status == "declined"),
];

export function gameName(game: Game) {
    return `${game.team1.name} — ${game.team2.name}`;
}

export function teamStatus(team: Team) {
    switch (team.status) {
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
    switch (team.status) {
        case "accepted":
            return 'success';
        case "waiting":
            return 'warning';
        case 'declined':
        default:
            return 'danger';
    }
}

export const callTypes: [CallType, string][] = [
    [1, "→"],
    [2, "←"],
    [3, "⇄"],
    [4, "⇆"],
    [5, "⥇"],
    [6, "⬾"],
]

export function callTypeToUnicode(num: CallType) {
    return callTypes[num - 1][1];
}
