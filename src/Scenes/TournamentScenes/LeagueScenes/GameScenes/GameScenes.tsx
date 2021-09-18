import React, {FC} from 'react';
import {League, Tournament} from "../../../../types/models";
import {Route, useParams, useRouteMatch} from "react-router";
import {ErrorHandler, LoaderPage, SwitchWith404} from "../../../../components";
import GameConsole from "../../../../components/models/Game/GameConsole";
import GameView from "../../../../components/models/Game/GameView";
import MenuItemComponent from "../../../../components/MenuItemComponent";
import {gameName} from "../../../../helpers";
import {Restricted} from "../../../../components";
import {useGame} from "../../../../helpers/hooks";


const GameIdScenes: FC<{ tour: Tournament, league: League }> = ({}) => {
    const {path} = useRouteMatch();
    const {gameId: gameIdString} = useParams<{ gameId: string }>();
    const gameId = parseInt(gameIdString);
    const [game, error, setGame] = useGame(gameId);

    if (error) return <ErrorHandler error={error}/>
    if (game === null) return <LoaderPage/>
    return (
        <MenuItemComponent title={gameName(game)}>
            <SwitchWith404>
                <Route exact path={`${path}`}>
                    <GameView game={game}/>
                </Route>
                <Route path={`${path}/console`}>
                    <MenuItemComponent title={"Консоль"}>
                        <Restricted access={game.manage_access}>
                            <GameConsole game={game} setGame={setGame}/>
                        </Restricted>
                    </MenuItemComponent>
                </Route>
            </SwitchWith404>
        </MenuItemComponent>
    )
}

const GameScenes: FC<{ tour: Tournament, league: League }> = ({tour, league}) => {
    const {path} = useRouteMatch();
    return (
        <SwitchWith404>
            <Route path={`${path}/:gameId`}>
                <GameIdScenes tour={tour} league={league}/>
            </Route>
        </SwitchWith404>
    )
}

export default GameScenes;
