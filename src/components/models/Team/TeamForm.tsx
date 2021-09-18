import React, {ComponentProps, FC, useState} from 'react';
import * as Yup from 'yup';
import {useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import {Button, Form, ListGroup} from "react-bootstrap";
import {Team, Tournament} from "../../../types/models";
import {teamServices} from "../../../services";
import {Redirect} from "react-router";
import {AppLoader} from "../../Loader";
import {FormBox} from "../../layout";
import {UserInputs} from "../User";
import {usersObject} from "../../../helpers/yupFields";
import FormInput from "../../FormInput";


export interface TeamFormProps {
    onSubmit: (data: TeamFormInputs) => Promise<any>,
    isLoading: boolean,
}

export interface TeamFormInputs {
    name: string,
    motto: string,
    players: UserInputs[],
}

export const TeamForm: FC<TeamFormProps> = ({onSubmit, isLoading}) => {
    const minPlayers = 4;
    const maxPlayers = 8;
    const validationSchema = Yup.object().shape({
        name: Yup.string().required("Необходимо указать название."),
        motto: Yup.string(),
        players: usersObject().min(minPlayers).max(maxPlayers),
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
            <FormBox.Group>
                <ListGroup.Item>
                    <FormInput
                        label="Название"
                        className="mb-3"
                        {...register("name")} error={errors.name}
                    />
                    <FormInput
                        label="Девиз"
                        className="mb-3"
                        {...register("motto")}
                        as="textarea"
                        style={{height: "100px"}}
                        error={errors.motto}
                    />
                    <FormInput
                        label="Количество участников"
                        onChange={(e) => setNumberOfPlayers(parseInt(e.currentTarget.value))}
                        customInput={
                            <Form.Select>
                                {numberOfPlayersChoicesArray().map((i) => (
                                    <option key={i} value={i}>{i}</option>
                                ))}
                            </Form.Select>
                        }
                    />
                </ListGroup.Item>

                <FormBox.Item>
                    {playersIndexes().map((i,) => (
                        <FormInput
                            key={i}
                            label={`Почта участника ${i + 1}`}
                            className={i === numberOfPlayers - 1 ? "" : "mb-3"}
                            {...register(`players.${i}.email`)}
                            error={errors.players?.[i]?.email}
                        />
                    ))}
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

export const NewTeamFormBox: FC<ComponentProps<typeof FormBox> &
    {
        tour: Tournament
    }>
    = ({
           tour, ...props
       }) =>
    (
        <
            FormBox size
                        =
                        "middle"
                    {...props
                    }
        >
            <FormBox.Title>
                Регистация команды
            </FormBox.Title>
            <NewTeamForm tour
                             ={
                tour
            }/>
        </FormBox>
    )
