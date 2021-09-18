import React, {ComponentProps, FC, useState} from 'react';
import {Tournament} from "../../../types/models";
import moment from 'moment';
import {Button, Form} from "react-bootstrap";
import {tournamentServices, ITournamentFormRequest} from "../../../services";
import {AppLoader} from "../../Loader";
import {Redirect} from "react-router";
import {FormBox} from "../../layout";
import * as Yup from "yup";
import {useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import FormInput from "../../FormInput";
import {UTCDateField} from "../../../helpers/yupFields";


export interface TournamentFormFields {
    title: string,
    description: string,
    place: string,
    start_time: string,
    end_time: string,
}

export type TournamentFormReturn = ITournamentFormRequest;

export interface TournamentFormProps {
    tour?: Tournament,
    onSubmit: (data: TournamentFormReturn) => Promise<any>,
    isLoading: boolean,
}

export const TournamentForm: FC<TournamentFormProps> = ({tour, ...props}) => {
    const validationSchema = Yup.object().shape({
        title: Yup.string().required(),
        description: Yup.string(),
        place: Yup.string().required(),
        start_time: UTCDateField().required(),
        end_time: UTCDateField().required(),
    })
    const {register, handleSubmit: rhfHandleSubmit, formState: {errors}} = useForm<TournamentFormFields>({
        resolver: yupResolver(validationSchema),
        defaultValues: tour && {
            title: tour.title,
            description: tour.description,
            place: tour.place,
            start_time: tour.start_time == null ? "" : moment(tour.start_time).format("YYYY-MM-DD"),
            end_time: tour.end_time == null ? "" : moment(tour.end_time).format("YYYY-MM-DD"),
        }
    });
    const handleSubmit = (data: TournamentFormFields) => {
        props.onSubmit(data);
    };

    if (props.isLoading) return <AppLoader/>
    return (
        <Form onSubmit={rhfHandleSubmit(handleSubmit)}>
            <fieldset>
                <FormBox.Group>
                    <FormBox.Item>
                        <FormInput
                            label={"Название *"}
                            className={"mb-3"}
                            {...register("title")}
                            error={errors.title}
                        />
                        <FormInput
                            label={"Дополнительная информация"}
                            className={"mb-3"}
                            type="text"
                            as="textarea"
                            {...register("description")}
                            error={errors.description}
                        />
                        <FormInput
                            label={"Место проведения"}
                            className={"mb-3"}
                            {...register("place")}
                            error={errors.place}
                        />
                        <FormInput
                            label={"Дата начала"}
                            className={"mb-3"}
                            type="date"
                            {...register("start_time")}
                        />
                        <FormInput
                            label={"Дата начала"}
                            type="date"
                            {...register("end_time")}
                            error={errors.end_time}
                        />
                    </FormBox.Item>
                    <FormBox.Item>
                        <Button variant="primary" type="submit">{tour ? "Изменить" : "Создать"}</Button>
                    </FormBox.Item>
                </FormBox.Group>
            </fieldset>
        </Form>
    );
};

export const NewTournamentForm: FC = () => {
    const [isLoading, setLoading] = useState(false);
    const [success, setSuccess] = useState<{ success: false } | { success: true, tourId: number }>({success: false})
    const handleSubmit = (data: ITournamentFormRequest) => {
        setLoading(true);
        return tournamentServices.postNew(data).then(
            (tour: Tournament) => {
                setLoading(false);
                setSuccess({success: true, tourId: tour.id});
            },
            () => {
                setLoading(false);
            });
    }
    if (success.success) return <Redirect to={`/tournament/${success.tourId}`}/>;
    return (
        <TournamentForm onSubmit={handleSubmit} isLoading={isLoading}/>
    );
}


interface EditTournamentFormProps {
    tour: Tournament,
    setTour: (tour: Tournament) => void
}

export const EditTournamentForm: FC<EditTournamentFormProps> = ({tour, setTour}) => {
    const [{isLoading, isSuccess}, setState] = useState({isLoading: false, isSuccess: false});
    const handleSubmit = (data: ITournamentFormRequest) => {
        setState({isLoading: true, isSuccess: false});
        return tournamentServices.edit(tour.id, data).then(
            (tour: Tournament) => {
                setState({isLoading: false, isSuccess: true});
                setTour(tour);
            },
            () => {
                setState({isLoading: false, isSuccess: false});
            });
    }
    if (isSuccess) return <Redirect to={`/tournament/${tour.id}`}/>;
    return (
        <TournamentForm onSubmit={handleSubmit} tour={tour} isLoading={isLoading}/>
    );
}


export const EditTournamentFormBox: FC<EditTournamentFormProps & ComponentProps<typeof FormBox>> = ({
                                                                                                        tour,
                                                                                                        setTour,
                                                                                                        ...props
                                                                                                    }) => (
    <FormBox size="middle" {...props}>
        <FormBox.Title>
            Редактирование турнира
        </FormBox.Title>
        <EditTournamentForm tour={tour} setTour={setTour}/>
    </FormBox>
)

export const NewTournamentFormBox: FC<ComponentProps<typeof FormBox>> = (props) => (
    <FormBox size="middle" {...props}>
        <FormBox.Title>
            Создание нового турнира
        </FormBox.Title>
        <NewTournamentForm/>
    </FormBox>
)

