import React, {FC, useEffect, useState} from 'react';
import {Game, League, Tournament} from "../../../../types/models";
import {Route, Switch, useParams, useRouteMatch} from "react-router";
import {LoaderPage} from "../../../../components";
import {gameServices} from "../../../../services";
import GameConsole from "../../../../components/models/Game/GameConsole";
import GameView from "../../../../components/models/Game/GameView";


const GameIdScenes: FC<{ tour: Tournament, league: League }> = ({tour, league}) => {
    const {path} = useRouteMatch();
    const {gameId: gameIdString} = useParams<{ gameId: string }>();
    const gameId = parseInt(gameIdString);
    const [game, setGame] = useState<null | Game>(null);
    useEffect(() => {
        gameServices.get(gameId).then(setGame);
    }, [gameId]);
    if (game === null) return <LoaderPage/>
    return (
        <Switch>
            <Route exact path={`${path}`}>
                <GameView game={game}/>
            </Route>
            <Route path={`${path}/console`}>
                <GameConsole game={game} setGame={setGame}/>
            </Route>
        </Switch>
    )
}

const GameScenes: FC<{ tour: Tournament, league: League }> = ({tour, league}) => {
    const {path} = useRouteMatch();
    return (
        <Switch>
            <Route path={`${path}/:gameId`}>
                <GameIdScenes tour={tour} league={league}/>
            </Route>
        </Switch>
    )
}

export default GameScenes;
