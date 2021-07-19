import React, {ComponentProps, FC, useState} from 'react';
import * as Yup from 'yup';
import {useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import {Button, FloatingLabel, Form, ListGroup} from "react-bootstrap";
import {Team, Tournament} from "../../../types/models";
import {teamServices, userServices} from "../../../services";
import {Redirect} from "react-router";
import {AppLoader} from "../../Loader";
import {FormBox} from "../../layout";


export interface TeamFormProps {
    onSubmit: (data: TeamFormInputs) => Promise<any>,
    isLoading: boolean,
}

interface PlayerInputs {
    email: string,
}

export interface TeamFormInputs {
    name: string,
    motto: string,
    players: PlayerInputs[],
}

export const TeamForm: FC<TeamFormProps> = ({onSubmit, isLoading}) => {
    const minPlayers = 4;
    const maxPlayers = 8;
    const validationSchema = Yup.object().shape({
        name: Yup.string().required("Необходимо указать название."),
        motto: Yup.string(),
        players: Yup.array().of(
            Yup.object().shape({
                email: Yup.string().required("Это поле обязательно").ensure()
                    .transform((value) => value.toLowerCase())
                    .email("Неправильный формат")
                    .test('exist', "Пользователь не найден", email => userServices.exist(email))
            }).test('email', 'Повторный игрок', function (value) {
                if (!value || !value.email) {
                    return true;
                }
                const { path } = this;
                const options = [...this.parent];
                const currentIndex = options.indexOf(value);

                const subOptions = options.slice(0, currentIndex);

                if (subOptions.some((option) => option.email === value.email)) {
                    throw this.createError({
                        path: `${path}.email`,
                        message: 'Повторяющийся игрок',
                    });
                }
                return true;
            })
        ).min(minPlayers).max(maxPlayers),
    });

    const {register, handleSubmit, formState: {errors}} = useForm<TeamFormInputs>({
        resolver: yupResolver(validationSchema)
    });

    const [numberOfPlayers, setNumberOfPlayers] = useState(minPlayers);


    function numberOfPlayersChoicesArray() {
        const res = [];
        for (let i = minPlayers; i <= maxPlayers; ++i) res.push(i);
        return res;
    }

    function playersIndexes() {
        const res = [];
        for (let i = 0; i < numberOfPlayers; ++i) res.push(i);
        return res;
    }

    if (isLoading) return <AppLoader/>
    return (
        <Form onSubmit={handleSubmit(onSubmit)}>
            <ListGroup variant="flush">
                <ListGroup.Item>
                    <FloatingLabel label="Название" className="mb-3">
                        <Form.Control {...register("name")} isInvalid={errors.name !== undefined}/>
                        <Form.Control.Feedback type="invalid">
                            {errors.name?.message}
                        </Form.Control.Feedback>
                    </FloatingLabel>
                    <FloatingLabel label="Девиз" className="mb-3">
                        <Form.Control {...register("motto")} as="textarea" style={{height: "100px"}}
                                      isInvalid={errors.name !== undefined}/>
                        <Form.Control.Feedback type="invalid">
                            {errors.motto?.message}
                        </Form.Control.Feedback>
                    </FloatingLabel>
                    <FloatingLabel label="Количество участников">
                        <Form.Select onChange={(e) => setNumberOfPlayers(parseInt(e.currentTarget.value))}>
                            {numberOfPlayersChoicesArray().map((i) => (
                                <option key={i} value={i}>{i}</option>
                            ))}
                        </Form.Select>
                    </FloatingLabel>
                </ListGroup.Item>

                <ListGroup.Item>
                    {playersIndexes().map((i,) => (
                        <FloatingLabel key={i}
                                       label={`Почта участника ${i + 1}`}
                                       className={i === numberOfPlayers - 1 ? "" : "mb-3"}
                        >
                            <Form.Control {...register(`players.${i}.email`)}
                                          isInvalid={errors.players?.[i]?.email?.message !== undefined}/>
                            <Form.Control.Feedback type="invalid">
                                {errors.players?.[i]?.email?.message}
                            </Form.Control.Feedback>
                        </FloatingLabel>
                    ))}
                </ListGroup.Item>
                <ListGroup.Item>
                    <Button variant="primary" type="submit">
                        Подтвердить
                    </Button>
                </ListGroup.Item>
            </ListGroup>
        </Form>
    );
}

export const NewTeamForm: FC<{ tour: Tournament }> = ({tour}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [team, setTeam] = useState<Team | null>(null)

    function handleSubmit(data: TeamFormInputs) {
        setIsLoading(true);
        return teamServices.postNew(tour.id, data).then((team) => {
            setIsLoading(false);
            setTeam(team);
            return team;
        }, (error) => {
            setIsLoading(false);
            return Promise.reject(error);
        })
    }

    if (team !== null) {
        return <Redirect to={`/tournament/${team.tournament.id}/team/${team.id}`}/>
    }
    return (
        <TeamForm onSubmit={handleSubmit} isLoading={isLoading}/>
    );
}

export const NewTeamFormBox: FC<ComponentProps<typeof FormBox> & {tour: Tournament}> = ({tour, ...props}) => (
    <FormBox size="middle" {...props}>
        <FormBox.Title>
            Регистация команды
        </FormBox.Title>
        <NewTeamForm tour={tour}/>
    </FormBox>
)
