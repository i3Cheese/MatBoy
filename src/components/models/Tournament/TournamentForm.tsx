import React, {ChangeEventHandler, Component, FormEventHandler} from 'react';
import {Tournament} from "../../../types/models";
import moment from 'moment';
import {Button, Form} from "react-bootstrap";
import {Fieldset} from "../../form/form";
import produce from "immer";
import {ITournamentFormRequest} from "../../../services";


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
    onSubmit: (data: TournamentFormReturn) => Promise<any>
}

class TournamentForm extends Component<TournamentFormProps, TournamentFormState> {
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
                    <Button variant="primary" type="submit">Создать</Button>
                </Fieldset>
            </Form>
        );
    }
}

export default TournamentForm;
