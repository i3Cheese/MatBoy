import React, {FC, useCallback, useState} from "react";
import {League, Team} from "../../../types/models";
import {Accordion, Button, ButtonGroup, ListGroup, ListGroupItem, useAccordionButton} from "react-bootstrap";
import {UserLink, UserMail} from "../User";
import {BoxTitle} from "../../layout";
import {TeamLink} from "../Team/Team";
import {LeagueForm, LeagueFormData} from "./LeagueForm";

export type EditLeagueCallback = (data: LeagueFormData, leagueId: number) => Promise<League>;
export type DeleteLeagueCallback = (leagueId: number) => Promise<any>;

export interface EditableLeagueConsoleItemProps {
    league: League,
    teams: Team[],
    onEditLeague: EditLeagueCallback,
    onDeleteLeague: DeleteLeagueCallback,
}

export const EditableLeagueConsoleItem: FC<EditableLeagueConsoleItemProps> = (
    {league,teams, onEditLeague, onDeleteLeague,}
) => {
    const [isEditing, setIsEditing] = useState(false);
    const handleToggle = useCallback(() => {
        setIsEditing(false)
    }, [setIsEditing])
    const handleSubmit = useCallback((data) => onEditLeague(data, league.id).then((data) => {
        setIsEditing(false);
        return data;
    }), [setIsEditing, league.id, onEditLeague])
    return (
        <EditableConsoleLeagueItemBorder league={league} onClick={handleToggle}>
            {isEditing ?
                <LeagueForm
                    league={league}
                    onSubmit={handleSubmit}
                    onReset={handleToggle}
                />
                :
                <ConsoleLeagueItemInfo
                    league={league}
                    teams={teams.filter((team) => team.league?.id === league.id)}
                    onEdit={() => setIsEditing(true)}
                    onDelete={onDeleteLeague}
                />
            }
        </EditableConsoleLeagueItemBorder>
    )
}

const ConsoleLeagueItemInfo: FC<{ league: League, teams: Team[], onEdit: () => void , onDelete: DeleteLeagueCallback}> = (
    {league, teams, onEdit, onDelete}
) => (
    <ListGroup variant="flush">
        <ListGroup.Item variant="secondary">
            Описание
        </ListGroup.Item>
        <ListGroup.Item>
            {league.description}
        </ListGroup.Item>
        <ListGroup.Item variant="secondary">
            Главный по лиге:
        </ListGroup.Item>
        <ListGroup horizontal>
            <ListGroup.Item className="flex-fill">
                <UserLink user={league.chief}/>
            </ListGroup.Item>
            <ListGroup.Item className="flex-fill">
                <UserMail user={league.chief}/>
            </ListGroup.Item>
        </ListGroup>
        <ListGroup.Item variant="secondary">
            Команды
        </ListGroup.Item>
        {teams.map((team) => (
            <ListGroupItem key={team.id}>
                <TeamLink team={team}/>
            </ListGroupItem>
        ))}
        <ListGroup.Item style={{padding: 0}}><ButtonGroup className="w-100">
            <Button variant="warning" onClick={onEdit}>Редактировать</Button>
            <Button variant="danger" onClick={()=>onDelete(league.id)}>Удалить</Button>
        </ButtonGroup></ListGroup.Item>
    </ListGroup>
)

const EditableConsoleLeagueItemBorder: FC<{ league: League, onClick: () => void }> = ({league, children, onClick}) => {
    const eventKey = `league#${league.id}`;
    const decoratedOnClick = useAccordionButton(eventKey, onClick);
    return (
        <Accordion.Item eventKey={eventKey}>
            <h2 className="accordion-header">
                <Accordion.Button onClick={decoratedOnClick}><BoxTitle>{league.title}</BoxTitle></Accordion.Button>
            </h2>
            <Accordion.Body className="p-0">
                {children}
            </Accordion.Body>
        </Accordion.Item>
    );
}