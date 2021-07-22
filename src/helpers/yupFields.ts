import * as Yup from "yup";
import {userServices} from "../services";

export const userObject = () => Yup.object().shape({
    email: Yup.string().required("Это поле обязательно").ensure()
        .transform((value) => value.toLowerCase())
        .email("Неправильный формат")
        .test('exist', "Пользователь не найден", email => userServices.exist(email))
})

