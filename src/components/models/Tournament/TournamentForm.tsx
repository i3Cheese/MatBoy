import React, {ChangeEventHandler, Component, ComponentProps, FC, FormEventHandler, useState} from 'react';
import {Tournament} from "../../../types/models";
import moment from 'moment';
import {Button, Form} from "react-bootstrap";
import {Fieldset} from "../../form/form";
import produce from "immer";
import {tournamentService, ITournamentFormRequest} from "../../../services";
import {AppLoader} from "../../Loader";
import {Redirect} from "react-router";
import {FormBox} from "../../layout";


export interface TournamentFormFields {
    title: string,
    description: string,
    place: string,
    start: string,
    end: string,
}

export type TournamentFormReturn = ITournamentFormRequest;

interface TournamentFormState {
    form: TournamentFormFields,
    isWaiting: boolean,
    accepted: boolean,
}

export interface TournamentFormProps {
    tour?: Tournament,
    onSubmit: (data: TournamentFormReturn) => Promise<any>,
    isLoading: boolean,
}

export class TournamentForm extends Component<TournamentFormProps, TournamentFormState> {
    constructor(props: TournamentFormProps) {
        super(props);
        const tour = props.tour;
        const form: TournamentFormFields = tour === undefined ?
            {
                title: "",
                description: "",
                place: "",
                start: "",
                end: "",
            } : {
                title: tour.title,
                description: tour.description,
                place: tour.place,
                start: tour.start == null ? "" : moment(tour.start).format("YYYY-MM-DD"),
                end: tour.end == null ? "" : moment(tour.start).format("YYYY-MM-DD"),
            };
        this.state = {
            form,
            isWaiting: false,
            accepted: false,
        }
    }

    parse = ({start, end, ...fields}: TournamentFormFields): TournamentFormReturn => ({
        start,
        end,
        ...fields,
    });

    handleSubmit: FormEventHandler = async (event) => {
        this.setState({isWaiting: true});
        this.props.onSubmit(this.parse(this.state.form)).then(
            () => {
                this.setState({isWaiting: false, accepted: true});
            },
            () => {
                this.setState({isWaiting: false, accepted: false})
            }
        )
        event.preventDefault();
    };
    handleChange: ChangeEventHandler<HTMLInputElement> = (event => {
        const name = event.target.name;
        const value = event.target.value;
        this.setState(produce(this.state, (draft) => {
            // @ts-ignore
            draft.form[name] = value;
        }));
    });

    render() {
        const form = this.state.form;
        if (this.props.isLoading) return <AppLoader/>
        return (
            <Form onSubmit={this.handleSubmit}>
                <Fieldset>
                    <Form.Group>
                        <Form.Label>Название *</Form.Label>
                        <Form.Control name="title" type="text" value={form.title} onChange={this.handleChange}/>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Дополнительная информация</Form.Label>
                        <Form.Control name="description" type="text" as="textarea" value={form.description}
                                      onChange={this.handleChange}/>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Место проведения</Form.Label>
                        <Form.Control name="place" type="text" value={form.place}
                                      onChange={this.handleChange}/>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Дата начала</Form.Label>
                        <Form.Control name="start" type="date" value={form.start}
                                      onChange={this.handleChange}
                                      className="datepicker-here"
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Дата начала</Form.Label>
                        <Form.Control name="end" type="date" value={form.end}
                                      onChange={this.handleChange}/>
                    </Form.Group>
                    <Button variant="primary" type="submit">{this.props.tour ? "Изменить" : "Создать"}</Button>
                </Fieldset>
            </Form>
        );
    }
}

export const NewTournamentForm: FC = () => {
    const [isLoading, setLoading] = useState(false);
    const [success, setSuccess] = useState<{ success: false } | { success: true, tourId: number }>({success: false})
    const handleSubmit = (data: ITournamentFormRequest) => {
        setLoading(true);
        return tournamentService.postNew(data).then(
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
        return tournamentService.edit(tour.id, data).then(
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


export const EditTournamentFormBox: FC<EditTournamentFormProps & ComponentProps<typeof FormBox>> = ({tour, setTour, ...props}) => (
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
        <NewTournamentForm />
    </FormBox>
)

