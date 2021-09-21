import {CallType, Game, PostBasics, Team} from "../types/models";

export const sortTeams = (teams: Team[]) => [
    ...teams.filter((team) => team.status == "waiting"),
    ...teams.filter((team) => team.status == "accepted"),
    ...teams.filter((team) => team.status == "declined"),
];

export function comparePosts(a: PostBasics, b: PostBasics): -1|0|1 {
    if (a.created_at > b.created_at)
        return -1;
    else if (a.created_at < b.created_at)
        return 1
    else
        return 0;
}

export const sortPosts = (posts: PostBasics[]) => posts.sort(comparePosts);

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
