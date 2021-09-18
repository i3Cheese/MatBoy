import React, {ComponentProps, FC, useState} from 'react';
import * as Yup from 'yup';
import {useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import {AppLoader} from "../../Loader";
import {Button, Form} from "react-bootstrap";
import {useHistory} from "react-router";
import {FormBox} from "../../layout";
import {Link} from "react-router-dom";
import {authActions} from "../../../actions";
import {useDispatch} from "react-redux";
import {AppDispatch} from "../../../store";
import FormInput from "../../FormInput";
import {UTCDateField} from "../../../helpers/yupFields";

export interface UserDataFormProps {
    onSubmit: (data: UserDataFormData) => Promise<any>,
    isLoading: boolean,
}

export interface UserDataFormData {
    email: string,
    password: string,
    name: string,
    surname: string,
    patronymic: string | null,
    birthday: string,
    city: string,
}

interface UserDataFormInputs extends UserDataFormData {
    password_again: string,
}

export const UserDataForm: FC<UserDataFormProps> = ({onSubmit, isLoading}) => {
    const validationSchema = Yup.object().shape({
        name: Yup.string().required(),
        surname: Yup.string().required(),
        patronymic: Yup.string().optional(),
        birthday: UTCDateField().required(),
        city: Yup.string().required(),
        email: Yup.string().required().email(),
        password: Yup.string().required(),
        password_again: Yup.string().required().test('passwords-match', 'Пароли не совпадают', function (value) {
            return this.parent.password === value
        }),
    })
    const {register, handleSubmit, formState: {errors}} = useForm<UserDataFormInputs>({
        resolver: yupResolver(validationSchema),
    });
    if (isLoading) return <AppLoader/>
    return (
        <Form onSubmit={handleSubmit(onSubmit)}>
            <FormBox.Group>
                <FormBox.Item>
                    <FormInput
                        label="Имя"
                        className="mb-3"
                        {...register("name")}
                        error={errors.name}
                    />
                    <FormInput
                        label="Фамилия"
                        className="mb-3"
                        {...register("surname")}
                        error={errors.surname}
                    />
                    <FormInput
                        label="Отчество"
                        className="mb-3"
                        {...register("patronymic")}
                        error={errors.patronymic}
                    />
                    <FormInput
                        label="Дата рождения"
                        className="mb-3"
                        {...register("birthday")}
                        type="date"
                        error={errors.birthday}
                    />
                    <FormInput
                        label="Город"
                        {...register("city")}
                        error={errors.city}
                    />
                </FormBox.Item>
                <FormBox.Item>
                    <FormInput
                        label="E-mail"
                        className="mb-3"
                        {...register("email")}
                        error={errors.email}
                    />
                    <FormInput
                        label="Пароль"
                        className="mb-3"
                        {...register("password")}
                        error={errors.password}
                        type={"password"}
                    />
                    <FormInput
                        label="Повторите пароль"
                        {...register("password_again")}
                        error={errors.password_again}
                        type={"password"}
                    />
                </FormBox.Item>
                <FormBox.Item>
                    <Button variant="primary" type="submit">
                        Подтвердить
                    </Button>
                </FormBox.Item>
            </FormBox.Group>
        </Form>
    );
}

export const RegistrationForm: FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const history = useHistory();
    const dispatch = useDispatch<AppDispatch>();

    function handleSubmit(data: UserDataFormData) {
        setIsLoading(true);
        return authActions.registration(data)(dispatch).then(
            (data) => {
                setIsLoading(false);
                history.push('/');
                return data;
            },
            (data) => {
                setIsLoading(false);
                return Promise.reject(data);
            }
        );
    }

    return (
        <UserDataForm onSubmit={handleSubmit} isLoading={isLoading}/>
    );
}

export const RegistrationFormBox: FC<ComponentProps<typeof FormBox>> = ({...props}) => (
    <FormBox size="middle" {...props}>
        <FormBox.Title>
            Регистация
        </FormBox.Title>
        <RegistrationForm/>
        <FormBox.Additions>
            <FormBox.Item>
                Передумали?&nbsp;
                <Link to="/" className="form-additional-message__link">
                    На главную
                </Link>
                <br/>
                Уже зарегестрированы?&nbsp;
                <Link to="/login" className="form-additional-message__link">
                    Войдите
                </Link>
            </FormBox.Item>
        </FormBox.Additions>
    </FormBox>
)
