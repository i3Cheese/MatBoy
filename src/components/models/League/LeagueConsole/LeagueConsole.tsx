import React, {FC, useCallback} from 'react';
import {Game, League, Team, Tournament} from "../../../../types/models";
import {LoaderPage} from "../../../Loader";
import {Box, BoxContainer, BoxTitle} from "../../../layout";
import {Accordion} from "react-bootstrap";
import {TeamConsoleItem} from "./TeamConsoleItem";
import {useGames, useTeams} from "../../../../helpers/hooks";
import {LeagueForm} from "../LeagueForm";
import {GameConsoleItem} from "./GameCosoleItem";
import {GameForm, GameFormData} from "../../Game/GameForm";
import {gameService} from "../../../../services";
import produce from "immer";

export interface LeagueConsoleProps {
    tour: Tournament,
    league: League,
}

const LeagueConsole: FC<LeagueConsoleProps> = ({tour, league}) => {
    const [teams, setTeams, refreshTeams] = useTeams(undefined, league.id);
    const [games, setGames, refreshGames] = useGames(league.id);

    const handleAddGame = useCallback((data: GameFormData) => (
        gameService.addGame(data, league.id).then((game) => {
            setGames(produce(games, (draft) => {
                if (draft !== null) draft.push(game);
            }))
            return game;
        })
    ), [setGames, games])

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
                />
            </BoxContainer>
        )
    }
}

const TeamList: FC<{ teams: Team[] }> = ({children, teams}) => (
    <Box size="middle">
        <BoxTitle>
            Команды
        </BoxTitle>
        <Accordion>{teams.map((team) => (
            <TeamConsoleItem team={team} key={team.id}/>
        ))}</Accordion>
    </Box>
)

interface GameListProps {
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
                                     onEditGame={async (data: any, gameId: any) => games[0]}
                                     onDeleteGame={async () => {
                                     }}
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
