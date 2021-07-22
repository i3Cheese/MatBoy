import React, {FC, useCallback} from "react";
import * as Yup from "yup";
import {useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import {AppLoader} from "../../Loader";
import {Button, FloatingLabel, Form} from "react-bootstrap";
import {FormBox} from "../../layout";
import {League,} from "../../../types/models";
import {userObject} from "../../../helpers/yupFields";
import {useLoadingOnCallback} from "../../../helpers/hooks";

export interface LeagueFormProps {
    onSubmit: (data: LeagueFormData) => Promise<any>,
    league?: League,
}

export interface LeagueFormData {
    title: string,
    description: string,
    chief: {email: string},
}

interface LeagueFormInputs extends LeagueFormData {
}

export const LeagueForm: FC<LeagueFormProps> = ({onSubmit, league}) => {
    const validationSchema = Yup.object().shape({
        title: Yup.string().required(),
        description: Yup.string().optional(),
        chief: userObject(),
    })
    const {register, handleSubmit: handleSubmitFormHook, formState: {errors}, reset} = useForm<LeagueFormInputs>({
        resolver: yupResolver(validationSchema),
        defaultValues: league,
    });
    const [isLoading, loadingOnSubmit] = useLoadingOnCallback(onSubmit);
    const handleSubmit = useCallback((data: LeagueFormInputs) => (
        loadingOnSubmit(data).then(
            reset,
        )
    ), [reset, loadingOnSubmit])
    if (isLoading) return <AppLoader/>
    return (
        <Form onSubmit={handleSubmitFormHook(handleSubmit)}>
            <FormBox.Group>
                <FormBox.Item>
                    <FloatingLabel label="Имя" className="mb-3">
                        <Form.Control {...register("title")} isInvalid={errors.title !== undefined}/>
                        <Form.Control.Feedback type="invalid">
                            {errors.title?.message}
                        </Form.Control.Feedback>
                    </FloatingLabel>
                    <FloatingLabel label="Описание" className="mb-3">
                        <Form.Control {...register("description")} as="textarea" style={{height: "100px"}}
                                      isInvalid={errors.description !== undefined}/>
                        <Form.Control.Feedback type="invalid">
                            {errors.description?.message}
                        </Form.Control.Feedback>
                    </FloatingLabel>
                    <FloatingLabel label={`Почта главного по лиге`}>
                        <Form.Control {...register(`chief.email`)}
                                      isInvalid={errors.chief?.email !== undefined}/>
                        <Form.Control.Feedback type="invalid">
                            {errors.chief?.email?.message}
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