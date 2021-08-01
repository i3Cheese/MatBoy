import React, {FC} from "react";
import {Team} from "../../../../types/models";
import {Accordion, ListGroup, ListGroupItem} from "react-bootstrap";
import {UserLink} from "../../User";
import {BoxTitle} from "../../../layout";


export const TeamConsoleItem: FC<{team: Team}> = (
    {team}
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
        </ListGroup>
    </TeamItemBorder>
);

const TeamItemBorder: FC<{ team: Team }> = ({children, team}) => {
    return (
        <Accordion.Item eventKey={`team#${team.id}`}>
            <Accordion.Header>
                <BoxTitle>{team.name}</BoxTitle>
            </Accordion.Header>
            <Accordion.Body style={{padding: 0}}>
                {children}
            </Accordion.Body>
        </Accordion.Item>
    )
}
