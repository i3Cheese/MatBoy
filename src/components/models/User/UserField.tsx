import React, {FC} from 'react';
import {Button, Form, InputGroup} from "react-bootstrap";
import {Control, Controller, useFieldArray} from "react-hook-form";
import * as rhf from 'react-hook-form';
import {FormGroup} from "../../layout/FormBox";
import {User} from "../../../types/models";


export interface UserInputs {
    email: string,
}

type Removable<T> = {
    removable?: false,
} | {
    removable: true,
    onRemove: (index: T) => any,
    index: T,
}

interface UserFieldBasicProps<FormInputs> {
    control: Control<FormInputs>,
    path: string,
    label: string,
    defaultValue?: any,
}

type UserFieldProps<FormInputs, T> = UserFieldBasicProps<FormInputs> & Removable<T>

export function UserField<FormInputs, T = any>(props: React.PropsWithChildren<UserFieldProps<FormInputs, T>>) {
    console.log(props);
    return (
        <rhf.Controller
            control={props.control}
            name={`${props.path}.email` as rhf.Path<FormInputs>}
            shouldUnregister={true}
            defaultValue={props.defaultValue?.email}
            render={({field,}) =>
                <InputGroup>
                    <Form.Control {...field} placeholder={'Введите email'}/>
                    {props.removable &&
                    <Button aria-label={"удалить пользователя"} onClick={() => props.onRemove(props.index)}
                            variant={'outline-secondary'}>
                        🗑
                    </Button>
                    }
                </InputGroup>}/>
    )
}

interface UsersListFieldsProps<FormInputs> {
    control: Control<FormInputs>,
    path: rhf.ArrayPath<FormInputs>,
    label: string,
}

export function UsersListFields<FormInputs>(props: React.PropsWithChildren<UsersListFieldsProps<FormInputs>>) {
    const {fields, append, remove} = useFieldArray({
        control: props.control,
        name: props.path,
    });
    return (<FormGroup>
            {fields.map((field: any, index) => (
                <UserField
                    control={props.control}
                    path={`${props.path}.${index}`}
                    label={"Email"}
                    removable={true}
                    onRemove={remove}
                    index={index}
                    key={field.id}
                    defaultValue={field}
                />
            ))}
            <Button onClick={() => append({email: ''} as any)}>+</Button>
        </FormGroup>
    )
}


export const UserSelect: FC<{ control?: Control<any>, path: string, users: User[] }> = (
    {control, path, users, ...props}) => (
    <Controller
        control={control}
        name={`${path}.id`}
        render={({field, fieldState}) => (
            <Form.Select {...props} {...field} isInvalid={fieldState.invalid}>
                <option/>
                {users.map((player, i) => (
                    <option value={player.id} key={player.id}>
                        {player.fullname}
                    </option>
                ))}
            </Form.Select>
        )}
    />
)
