import React, {FC, useCallback} from 'react';
import {Game, League, Team, Tournament} from "../../../../types/models";
import {LoaderPage} from "../../../Loader";
import {Box, BoxContainer, BoxTitle} from "../../../layout";
import {Accordion} from "react-bootstrap";
import {TeamConsoleItem} from "./TeamConsoleItem";
import {useGames, useTeams} from "../../../../helpers/hooks";
import {GameCallbacks, GameConsoleItem} from "./GameCosoleItem";
import {GameForm, GameFormData} from "../../Game";
import {gameServices} from "../../../../services";
import produce from "immer";

export interface LeagueConsoleProps {
    tour: Tournament,
    league: League,
}

const LeagueConsole: FC<LeagueConsoleProps> = ({league}) => {
    const [teams, teamsError, , refreshTeams] = useTeams(undefined, league.id);
    const [games, gamesError, setGames] = useGames(league.id);

    const handleAddGame = useCallback((data: GameFormData) => (
        gameServices.addGame(data, league.id).then((game) => {
            setGames(produce(games, (draft) => {
                if (draft !== null) draft.push(game);
            }))
            return game;
        })
    ), [setGames, games]);

    const handleEditGame = useCallback((data: GameFormData, gameId: number) => (
        gameServices.editGame(data, gameId).then(game => {
            setGames(produce(games, draft => {
                if (draft === null) return;
                const i = draft.findIndex(g => g.id === gameId);
                if (i >= 0) {
                    draft[i] = game;
                }
            }));
            return game;
        })
    ), [setGames, games]);
    const handleDeleteGame = useCallback((gameId) => (
        gameServices.deleteGame(gameId).then(
            () => {
                setGames(produce(games, (draft) => {
                    if (draft === null) return;
                    const i = draft.findIndex(g => g.id === gameId);
                    draft.splice(i, 1);
                }));
                refreshTeams();
            }
        )
    ), [setGames, games]);

    if (teams === null || games === null)
        return <LoaderPage/>
    else {
        return (
            <BoxContainer covid>
                <TeamList teams={teams}/>
                <GameList
                    teams={teams}
                    games={games}
                    onAddGame={handleAddGame}
                    onEditGame={handleEditGame}
                    onDeleteGame={handleDeleteGame}
                />
            </BoxContainer>
        )
    }
}

const TeamList: FC<{ teams: Team[] }> = ({teams}) => (
    <Box size="middle">
        <BoxTitle>
            Команды
        </BoxTitle>
        <Accordion>{teams.map((team) => (
            <TeamConsoleItem team={team} key={team.id}/>
        ))}</Accordion>
    </Box>
)

interface GameListProps extends GameCallbacks{
    teams: Team[],
    games: Game[]
    onAddGame: (data: GameFormData) => Promise<Game>,
}

const GameList: FC<GameListProps> = ({teams, games, onAddGame, ...callbacks}) => {
    return (
        <Box size="middle">
            <BoxTitle>
                Игры
            </BoxTitle>
            <Accordion>
                {games.map((game) => (
                    <GameConsoleItem key={game.id}
                                     teams={teams}
                                     game={game}
                                     {...callbacks}
                    />
                ))}
                <Accordion.Item eventKey="league#new" className="border-success">
                    <h2 className="accordion-header">
                        <Accordion.Button>
                            Новая игра
                        </Accordion.Button>
                    </h2>
                    <Accordion.Body className="p-0">
                        <GameForm onSubmit={onAddGame} teams={teams}/>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
        </Box>
    )
}

export default LeagueConsole;
