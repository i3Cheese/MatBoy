import React, {FC, useCallback, useMemo} from "react";
import {League, Team} from "../../../types/models";
import {Accordion, Badge, Button, ButtonGroup, Form, ListGroup, ListGroupItem} from "react-bootstrap";
import {UserLink} from "../User";
import {BoxTitle} from "../../layout";
import {useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import * as Yup from 'yup';


export type AcceptTeamCallback = (teamId: number, leagueId: number) => Promise<Team>
export type DeclineTeamCallback = (teamId: number,) => Promise<Team>
export type RestoreTeamCallback = (teamId: number,) => Promise<Team>

export interface TeamCallbacks {
    onAccept: AcceptTeamCallback,
    onDecline: DeclineTeamCallback,
    onRestore: RestoreTeamCallback,
}

export interface EditableTeamConsoleItemProps extends TeamCallbacks {
    team: Team,
    leagues: League[],
}

export const EditableTeamConsoleItem: FC<EditableTeamConsoleItemProps> = (
    {team, leagues, ...callbacks}
) => (
    <TeamItemBorder team={team}>
        <ListGroup variant="flush">
            <ListGroup.Item variant="secondary">
                Девиз
            </ListGroup.Item>
            <ListGroup.Item>
                {team.motto}
            </ListGroup.Item>
            <ListGroup.Item variant="secondary">
                Отправил:
            </ListGroup.Item>
            <ListGroup horizontal>
                <ListGroup.Item className="flex-fill">
                    <UserLink user={team.trainer}/>
                </ListGroup.Item>
                <ListGroup.Item className="flex-fill">
                    <a href={`mailto:${team.trainer.email}`}>{team.trainer.email}</a>
                </ListGroup.Item>
            </ListGroup>
            <ListGroup.Item variant="secondary">
                Участники
            </ListGroup.Item>
            {team.players.map((user, i) => <ListGroupItem key={user.id + '|' + i}>
                <UserLink user={user}/>
            </ListGroupItem>)}
            <ListGroup.Item variant="secondary">
                Лига
            </ListGroup.Item>
            <TeamIterations team={team} leagues={leagues} {...callbacks}/>
        </ListGroup>
    </TeamItemBorder>
);

const TeamItemBorder: FC<{ team: Team }> = ({children, team}) => {
    let statusText: string;
    let borderColor: string;
    switch (team.status_string) {
        case "accepted":
            statusText = "Участвует в турнире";
            borderColor = "success";
            break;
        case "waiting":
            statusText = "Ожидает подтверждения";
            borderColor = "warning";
            break;
        case "deleted":
            statusText = "Отклонена";
            borderColor = "danger";
            break;
    }
    return (
        <Accordion.Item eventKey={`team#${team.id}`} className={`border border-2 border-${borderColor}`}>
            <Accordion.Header>
                <BoxTitle style={{flexGrow: 1}}>{team.name}</BoxTitle>
                {team.status_string === "waiting" && <Badge bg={borderColor}>{statusText}</Badge>}
            </Accordion.Header>
            <Accordion.Body style={{padding: 0}}>
                {children}
            </Accordion.Body>
        </Accordion.Item>
    )
    // const handleClick = useAccordionButton(team.id.toString());
    // return (
    //     <Card className={`border border-${borderColor}` }>
    //         <Card.Header onClick={handleClick}>
    //             <span>{statusText}</span>
    //             <BoxTitle>{team.name}</BoxTitle>
    //         </Card.Header>
    //         <Accordion.Collapse eventKey={team.id.toString()}>
    //             <Card.Body>
    //                 {children}
    //             </Card.Body>
    //         </Accordion.Collapse>
    //     </Card>
    // )
}

const TeamIterations: FC<{ team: Team, leagues: League[] } & TeamCallbacks> = ({team, leagues, ...props}) => {
    const {register, handleSubmit, formState: {errors}} = useForm<{ leagueId: number }>({
        resolver: yupResolver(Yup.object().shape({
            leagueId: Yup.number().required(),
        }))
    });
    const handleAccept = useCallback(handleSubmit(
        ({leagueId}) => props.onAccept(team.id, leagueId)),
        [handleSubmit, props.onAccept, team.id]
    );
    const acceptButton = useMemo(() =>
            <Button variant="success" onClick={handleAccept}>Принять</Button>,
        [handleAccept]);
    const restoreButton = useMemo(() =>
            <Button variant="warning" onClick={() => props.onRestore(team.id)}>Вернуть на рассмотрение</Button>,
        [props.onRestore]);
    const declineButton = useMemo(() =>
            <Button variant="danger" onClick={() => props.onDecline(team.id)}>Отклонить</Button>,
        [props.onDecline]);
    return (
        <>
            {team.status_string === "waiting" || team.status_string === "deleted" ?
                <ListGroup.Item as={Form.Select} {...register('leagueId')} isInvalid={errors.leagueId !== undefined}>
                    <option/>
                    {leagues.map((league) => (
                        <option key={league.id} value={league.id}>
                            {league.title}
                        </option>
                    ))}
                </ListGroup.Item>
                :
                <ListGroup.Item>{team.league?.title || "error"}</ListGroup.Item>
            }
            <ListGroup.Item style={{padding: 0}}><ButtonGroup className="w-100">
                {team.status_string === "accepted" && <>
                    {restoreButton}
                </>}
                {team.status_string === "waiting" &&
                <>
                    {declineButton}{acceptButton}
                </>}
                {team.status_string === "deleted" && <>
                    {acceptButton}{restoreButton}
                </>}
            </ButtonGroup></ListGroup.Item>
        </>
    );
}
