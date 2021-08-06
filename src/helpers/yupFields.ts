import * as Yup from "yup";
import {userServices} from "../services";
import {Team} from "../types/models";

export const userObject = () => Yup.object().shape({
    email: Yup.string().required("Это поле обязательно").ensure()
        .transform((value) => value.toLowerCase())
        .email("Неправильный формат")
        .test('exist', "Пользователь не найден", email => userServices.exist(email))
})

export const teamObject = ({teams} : {teams: Team[]}) => Yup.object().shape({
    id: Yup.number().required("Это поле обязательно").oneOf(teams.map((team) => team.id))
})