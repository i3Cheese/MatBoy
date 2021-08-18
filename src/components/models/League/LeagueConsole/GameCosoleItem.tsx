import React, {FC, useCallback, useState} from "react";
import {Game, Team} from "../../../../types/models";
import {Accordion, Button, ListGroup, useAccordionButton} from "react-bootstrap";
import {BoxTitle, DateSpan} from "../../../layout";
import {GameForm, GameFormData} from "../../Game";
import {ButtonGroupItem, ListGroupUserData, TitledItem} from "../../../ConsoleItem";
import {gameName} from "../../../../helpers";

export type EditGameCallback = (data: GameFormData, gameId: number) => Promise<Game>;
export type DeleteGameCallback = (gameId: number) => Promise<any>;

export interface GameCallbacks {
    onEditGame: EditGameCallback,
    onDeleteGame: DeleteGameCallback,
}

export interface GameConsoleItemProps extends GameCallbacks{
    game: Game,
    teams: Team[],
}

export const GameConsoleItem: FC<GameConsoleItemProps> = (
    {game, teams, onEditGame, onDeleteGame,}
) => {
    const [isEditing, setIsEditing] = useState(false);
    const handleToggle = useCallback(() => {
        setIsEditing(false)
    }, [setIsEditing])
    const handleSubmit = useCallback((data) => onEditGame(data, game.id).then((data) => {
        setIsEditing(false);
        return data;
    }), [setIsEditing, game.id, onEditGame])
    return (
        <GameItemBorder game={game} onClick={handleToggle}>
            {isEditing ?
                <GameForm
                    game={game}
                    onSubmit={handleSubmit}
                    onReset={handleToggle}
                    teams={teams}
                />
                :
                <ListGroup variant="flush">
                    <TitledItem label="Место проведения">
                        {game.place}
                    </TitledItem>
                    <TitledItem label={'Время начала'}>
                        <DateSpan date={game.start} time={true} local={true}/>
                    </TitledItem>
                    <TitledItem label="Судья">
                        <ListGroupUserData user={game.judge}/>
                    </TitledItem>
                    <ButtonGroupItem>
                        <Button variant="warning" onClick={() => setIsEditing(true)}>Редактировать</Button>
                        <Button variant="danger" onClick={() => onDeleteGame(game.id)}>Удалить</Button>
                    </ButtonGroupItem>
                </ListGroup>
            }
        </GameItemBorder>
    )
}


const GameItemBorder: FC<{ game: Game, onClick: () => void }> = ({game, children, onClick}) => {
    const eventKey = `game#${game.id}`;
    const decoratedOnClick = useAccordionButton(eventKey, onClick);
    return (
        <Accordion.Item eventKey={eventKey}>
            <h2 className="accordion-header">
                <Accordion.Button onClick={decoratedOnClick}><BoxTitle>{gameName(game)}</BoxTitle></Accordion.Button>
            </h2>
            <Accordion.Body className="p-0">
                {children}
            </Accordion.Body>
        </Accordion.Item>
    );
}