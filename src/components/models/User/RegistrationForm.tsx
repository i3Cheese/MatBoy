import React, {ComponentProps, FC, useState} from 'react';
import * as Yup from 'yup';
import {useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import {AppLoader} from "../../Loader";
import {Button, FloatingLabel, Form} from "react-bootstrap";
import {useHistory} from "react-router";
import {FormBox} from "../../layout";
import {Link} from "react-router-dom";
import {authActions} from "../../../actions";
import {useDispatch} from "react-redux";
import {AppDispatch} from "../../../store";

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
        birthday: Yup.string().required(),
        city: Yup.string().required(),
        email: Yup.string().required().email(),
        password: Yup.string().required(),
        password_again: Yup.string().required().test('passwords-match', 'Пароли не совпадают', function(value){
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
                    <FloatingLabel label="Имя" className="mb-3">
                        <Form.Control {...register("name")} isInvalid={errors.name !== undefined}/>
                        <Form.Control.Feedback type="invalid">
                            {errors.name?.message}
                        </Form.Control.Feedback>
                    </FloatingLabel>
                    <FloatingLabel label="Фамилия" className="mb-3">
                        <Form.Control {...register("surname")} isInvalid={errors.surname !== undefined}/>
                        <Form.Control.Feedback type="invalid">
                            {errors.surname?.message}
                        </Form.Control.Feedback>
                    </FloatingLabel>
                    <FloatingLabel label="Отчество" className="mb-3">
                        <Form.Control {...register("patronymic")} isInvalid={errors.patronymic !== undefined}/>
                        <Form.Control.Feedback type="invalid">
                            {errors.patronymic?.message}
                        </Form.Control.Feedback>
                    </FloatingLabel>
                    <FloatingLabel label="Дата рождения" className="mb-3">
                        <Form.Control {...register("birthday")} type="date" isInvalid={errors.birthday !== undefined}/>
                        <Form.Control.Feedback type="invalid">
                            {errors.birthday?.message}
                        </Form.Control.Feedback>
                    </FloatingLabel>
                    <FloatingLabel label="Город">
                        <Form.Control {...register("city")} isInvalid={errors.city !== undefined}/>
                        <Form.Control.Feedback type="invalid">
                            {errors.city?.message}
                        </Form.Control.Feedback>
                    </FloatingLabel>
                </FormBox.Item>
                <FormBox.Item>
                    <FloatingLabel label="Email" className="mb-3">
                        <Form.Control {...register("email")} isInvalid={errors.email !== undefined}/>
                        <Form.Control.Feedback type="invalid">
                            {errors.email?.message}
                        </Form.Control.Feedback>
                    </FloatingLabel>
                    <FloatingLabel label="Пароль" className="mb-3">
                        <Form.Control {...register("password")} isInvalid={errors.password !== undefined}/>
                        <Form.Control.Feedback type="invalid">
                            {errors.password?.message}
                        </Form.Control.Feedback>
                    </FloatingLabel>
                    <FloatingLabel label="Повторите пароль">
                        <Form.Control {...register("password_again")} isInvalid={errors.password_again !== undefined}/>
                        <Form.Control.Feedback type="invalid">
                            {errors.password_again?.message}
                        </Form.Control.Feedback>
                    </FloatingLabel>
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
        return  authActions.registration(data)(dispatch).then(
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

export const RegistrationFormBox: FC<ComponentProps<typeof FormBox> > = ({...props}) => (
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
                Ещё нет аккаунта?&nbsp;
                <Link to="/registration" className="form-additional-message__link">
                    Зарегистрируйтесь
                </Link>
                <br/>
                Забыли пароль?&nbsp;
                <Link to="/reset_password" className="form-additional-message__link">
                    {/*TODO: reset_password*/}
                    Восстановить
                </Link>
            </FormBox.Item>
        </FormBox.Additions>
    </FormBox>
)
