import React, {FC, useCallback} from "react";
import * as Yup from "yup";
import {useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import {Button, ButtonGroup, Form, FormSelectProps} from "react-bootstrap";
import {AppLoader} from "../../Loader";
import {FormBox} from "../../layout";
import {Game, Team,} from "../../../types/models";
import {teamObject, userObject} from "../../../helpers/yupFields";
import {useLoadingOnCallback} from "../../../helpers/hooks";
import FloatingDatePicker from "../../FloatingDatePicker";
import FormInput from "../../FormInput";


export interface GameFormProps {
    onSubmit: (data: GameFormData) => Promise<any>,
    onReset?: () => void,
    game?: Game,
    teams: Team[],
}

interface TeamData {
    id: number,
}

export interface GameFormData {
    place: string,
    start: Date,
    judge: { email: string },
    team1: TeamData,
    team2: TeamData,
}

interface GameFormInputs extends GameFormData {
}


export const GameForm: FC<GameFormProps> = ({onSubmit, game, teams, onReset}) => {
    const validationSchema = Yup.object().shape({
        place: Yup.string().notRequired(),
        start: Yup.date().notRequired(),
        judge: userObject(),
        team1: teamObject({teams}),
        team2: teamObject({teams}).test('not-same-teams', 'Команды не должны совпадать', function (value) {
            if (this.parent.team1.id === value.id) {
                throw this.createError({
                    path: `${this.path}.id`,
                    message: 'Команды не должны совпадать',
                });
            }
            return true;
        }),
    });
    const {
        control,
        register,
        handleSubmit: handleSubmitFormHook,
        formState: {errors},
        reset
    } = useForm<GameFormInputs>({
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
                    <FormInput label="Место проведения" mb
                               {...register("place")}
                               error={errors.place}
                    />
                    <FloatingDatePicker control={control}
                                        name={'start'}
                                        label={'Дата и время начала'}
                                        error={errors.start}
                                        mb
                                        showTime
                    />
                    <FormInput label={`Почта судьи`} {...register(`judge.email`)} error={errors.judge?.email}/>
                </FormBox.Item>
                <FormBox.Item>
                    <FormInput label={"Первая команда"} customInput={<TeamSelect teams={teams}/>}
                               {...register('team1.id')} error={errors.team1?.id}
                               mb
                    />
                    <FormInput label={"Вторая команда"} customInput={<TeamSelect teams={teams}/>}
                               {...register('team2.id')} error={errors.team2?.id}
                    />

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

interface TeamSelectProps extends FormSelectProps{
    teams: Team[],
    selected?: number,
}

const TeamSelect = React.forwardRef<HTMLSelectElement, TeamSelectProps>(({teams, selected, ...props}, ref) => (
    <Form.Select {...props} defaultValue={selected} ref={ref}>
        <option/>
        {teams.map((team) => (
            <option value={team.id} key={team.id}>
                {team.name}
            </option>
        ))}
    </Form.Select>
));