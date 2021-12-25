import React, {FC, useCallback, useEffect, useMemo, useState} from 'react';
import {AccessGroup} from "../../../types/models";
import {Button, Form, InputGroup, ListGroup} from "react-bootstrap";
import {UserLink, UserMail} from "../User";
import {useForm} from "react-hook-form";
import * as Yup from 'yup';
import {yupResolver} from "@hookform/resolvers/yup";
import {AppLoader} from "../../Loader";
import {agServices} from "../../../services";
import produce from "immer";
import {userObject} from "../../../helpers/yupFields";


type AccessGroupEditorProps = { accessGroup: AccessGroup } | { accessGroupId: number }

const AccessGroupEditor: FC<AccessGroupEditorProps> = ({...props}) => {
    const accessGroupId = useMemo(()=>('accessGroup' in props ? props.accessGroup.id : props.accessGroupId), []);
    const [accessGroup, setAccessGroup] = useState('accessGroup' in props ? props.accessGroup : null);
    const [blocked, setBlocked] = useState(true);

    useEffect(() => {
        agServices.get(accessGroupId).then(ag => {
            setAccessGroup(ag);
            setBlocked(false)
        });
    }, [accessGroupId,]);

    const {register, handleSubmit: handleSubmitForm ,reset} = useForm({
        resolver: yupResolver(Yup.object().shape({
            newMember: userObject(),
        })),
    });
    const handleAdd = useCallback(handleSubmitForm((data) => {
        setBlocked(true);
        agServices.addMember(accessGroupId, data.newMember).then(
            ({member}) => {
                setAccessGroup(produce(accessGroup, draft => {
                    if (draft !== null) {
                        const i = draft.members.findIndex(m => m.id === member.id);
                        if (i === -1)
                            draft.members.push(member);
                    }
                }));
                setBlocked(false);
                reset();
            }
        );
    }), [handleSubmitForm, accessGroupId]);

    const handleRemove = useCallback((member) => {
        setBlocked(true);
        agServices.removeMember(accessGroupId, member).then(
            () => {
                setAccessGroup(produce(accessGroup, draft => {
                    if (draft === null) return;
                    const i = draft.members.findIndex(m => m.id === member.id);
                    draft.members.splice(i, 1);
                }));
                setBlocked(false);
            }
        );
    }, [accessGroupId]);


    if (accessGroup === null) {
        return <AppLoader/>
    }
    return (
        <>
            <Form onSubmit={handleAdd}>
                <InputGroup title={'Добавить редактора'}>
                    <Form.Control {...register('newMember.email')} placeholder={'Введите email'} disabled={blocked}/>
                    <Button variant={"outline-success"} type="submit" aria-label={"Подтвердить"}
                            disabled={blocked}>✓</Button>
                </InputGroup>
            </Form>
            {accessGroup.members.map((user, index) => (
                <ListGroup horizontal key={user.id}>
                    <ListGroup.Item className={'flex-fill'}><UserMail user={user}/></ListGroup.Item>
                    <ListGroup.Item className={'flex-fill'}><UserLink user={user}/></ListGroup.Item>
                    <Button aria-label={"удалить пользователя"}
                            variant={'outline-secondary'}
                            disabled={blocked}
                            onClick={() => handleRemove(user)}
                    >
                        🗑
                    </Button>
                </ListGroup>
            ))}
        </>
    )
}


export default AccessGroupEditor;