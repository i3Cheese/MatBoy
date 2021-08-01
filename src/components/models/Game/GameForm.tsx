import React, {FC, useCallback} from "react";
import * as Yup from "yup";
import {useForm, Controller, FieldValues} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import DatePicker from 'react-datepicker';
import {Button, ButtonGroup, FloatingLabel, Form} from "react-bootstrap";
import {AppLoader} from "../../Loader";
import {FormBox} from "../../layout";
import {Game, Team,} from "../../../types/models";
import {userObject} from "../../../helpers/yupFields";
import {useLoadingOnCallback} from "../../../helpers/hooks";
import FloatingDatePicker from "../../FloatingDatePicker";

export interface GameFormProps {
    onSubmit: (data: GameFormData) => Promise<any>,
    onReset?: () => void,
    game?: Game,
    teams: Team[],
}

export interface GameFormData {
    place: string,
    start: Date,
    judge: { email: string },
}

interface GameFormInputs extends GameFormData {
}

export const GameForm: FC<GameFormProps> = ({onSubmit, game, teams, onReset}) => {
    const validationSchema = Yup.object().shape({
        place: Yup.string().notRequired(),
        start: Yup.date().notRequired(),
        judge: userObject(),
    })
    const {control, register, handleSubmit: handleSubmitFormHook, formState: {errors}, reset} = useForm<GameFormInputs>({
        resolver: yupResolver(validationSchema),
        defaultValues: game,
    });
    const [isLoading, loadingOnSubmit] = useLoadingOnCallback(onSubmit);
    const handleSubmit = useCallback((data: GameFormData) => {
        console.log(data);
        return (
            loadingOnSubmit(data).then(
                (r) => {
                    reset();
                    return r;
                },
            )
        );
    }, [reset, loadingOnSubmit])
    const handleReset = useCallback(() => {
        (onReset || reset)();
    }, [onReset, reset])
    if (isLoading) return <AppLoader/>
    return (
        <Form onSubmit={handleSubmitFormHook(handleSubmit)} onReset={handleReset}>
            <FormBox.Group>
                <FormBox.Item>
                    <FloatingLabel label="Место проведения" className="mb-3">
                        <Form.Control {...register("place")} isInvalid={errors.place !== undefined}/>
                        <Form.Control.Feedback type="invalid">
                            {errors.place?.message}
                        </Form.Control.Feedback>
                    </FloatingLabel>
                    <FloatingDatePicker control={control} name={'start'} label={'Дата и время начала'} error={errors.start} className="mb-3"/>
                    <FloatingLabel label={`Почта судьи`}>
                        <Form.Control {...register(`judge.email`)}
                                      isInvalid={errors.judge?.email !== undefined}/>
                        <Form.Control.Feedback type="invalid">
                            {errors.judge?.email?.message}
                        </Form.Control.Feedback>
                    </FloatingLabel>
                </FormBox.Item>
                <FormBox.Item>
                    <ButtonGroup className="w-100">
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