import * as Yup from "yup";
import {userServices} from "../services";
import {Game, Team, User} from "../types/models";
import exp from "constants";


export const userObject = () => Yup.object().shape({
    email: Yup.string().required("Это поле обязательно").ensure()
        .transform((value) => value.toLowerCase())
        .email("Неправильный формат")
        .test('exist', "Пользователь не найден", email => userServices.exist(email))
})

export const usersObject = (duplicateMessage = 'Этот пользователь указан несколько раз') => Yup.array().of(
    userObject().test('email', duplicateMessage, function (value) {
        if (!value || !value.email) {
            return true;
        }
        const {path} = this;
        const options = [...this.parent];
        const currentIndex = options.indexOf(value);

        const subOptions = options.slice(0, currentIndex);

        if (subOptions.some((option) => option.email === value.email)) {
            throw this.createError({
                path: `${path}.email`,
                message: duplicateMessage,
            });
        }
        return true;
    })
)

export const userSelectObject = (users: User[]) => Yup.object({
    id: Yup.number().required().oneOf(users.map(user => user.id)),
});

export const usersSelectObject = (users: User[], duplicateMessage = 'Этот пользователь указан несколько раз') => Yup.array().of(
    userSelectObject(users).test('id', duplicateMessage, function (value) {
        if (!value || !value.id) {
            return true;
        }
        const {path} = this;
        const options = [...this.parent];
        const currentIndex = options.indexOf(value);

        const subOptions = options.slice(0, currentIndex);

        if (subOptions.some((option) => option.id === value.id)) {
            throw this.createError({
                path: `${path}.id`,
                message: duplicateMessage,
            });
        }
        return true;
    })
)

export const teamObject = (teams: Team[]) => Yup.object().shape({
    id: Yup.number().required("Это поле обязательно").oneOf(teams.map((team) => team.id))
})

export const teamProtocolDataObject = (team: Team) => Yup.object({
    captain: userSelectObject(team.players),
    deputy: userSelectObject(team.players),
});

export const teamRoundDataObject = (team: Team) => Yup.object({
    points: Yup.number().required().default(0),
    stars: Yup.number().required().default(0),
    players: usersSelectObject(team.players),
});


export const roundObject = (game: Game) => Yup.object({
    team1_data: teamRoundDataObject(game.team1),
    team2_data: teamRoundDataObject(game.team2),
    problem: Yup.number(),
    call_type: Yup.number().oneOf([1, 2, 3, 4, 5, 6]),
    additional: Yup.string().ensure()
})

export const roundsObject = (game: Game) => Yup.array(roundObject(game))

export const protocolObject = (game: Game) => Yup.object({
    rounds: roundsObject(game),
    captain_task: Yup.string().ensure(),
    captain_winner: teamObject([game.team1, game.team2]),
    team1_data: teamProtocolDataObject(game.team1),
    team2_data: teamProtocolDataObject(game.team2),
    additional: Yup.string().ensure(),
})
