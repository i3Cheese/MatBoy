import React, {FC, useCallback} from "react";
import * as Yup from "yup";
import {useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import {AppLoader} from "../../Loader";
import {Button, ButtonGroup, FloatingLabel, Form} from "react-bootstrap";
import {FormBox} from "../../layout";
import {League,} from "../../../types/models";
import {useLoadingOnCallback} from "../../../helpers/hooks";

export interface LeagueFormProps {
    onSubmit: (data: LeagueFormData) => Promise<any>,
    onReset?: () => void,
    league?: League,
}

export interface LeagueFormData {
    title: string,
    description: string,
    chief: {email: string},
}

interface LeagueFormInputs extends LeagueFormData {
}

export const LeagueForm: FC<LeagueFormProps> = ({onSubmit, league, onReset}) => {
    const validationSchema = Yup.object().shape({
        title: Yup.string().required(),
        description: Yup.string().optional(),
    })
    const {register, handleSubmit: handleSubmitFormHook, formState: {errors}, reset} = useForm<LeagueFormInputs>({
        resolver: yupResolver(validationSchema),
        defaultValues: league,
    });
    const [isLoading, loadingOnSubmit] = useLoadingOnCallback(onSubmit);
    const handleSubmit = useCallback((data: LeagueFormInputs) => (
        loadingOnSubmit(data).then(
            (r) => {
                reset();
                return r;
            },
        )
    ), [reset, loadingOnSubmit])
    const handleReset = useCallback(() => {
        (onReset || reset)();
    }, [onReset, reset])
    if (isLoading) return <AppLoader/>
    return (
        <Form onSubmit={handleSubmitFormHook(handleSubmit)} onReset={handleReset}>
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
                </FormBox.Item>
                <FormBox.Item>
                    <ButtonGroup className="w-100" >
                        <Button variant="primary" type="submit">
                            Подтвердить
                        </Button>
                        <Button variant="danger" type="reset">
                            Отменить
                        </Button>
                    </ButtonGroup>
                </FormBox.Item>
            </FormBox.Group>
        </Form>
    );
}