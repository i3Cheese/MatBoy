import React, {FC} from 'react';
import {Route, Switch, useRouteMatch} from "react-router";
import NewTournament from "./NewTournament";

const TournamentScenes: FC = () => {
    const {path, url} = useRouteMatch();
    return (
        <Switch>
            <Route path={`${path}/new`} component={NewTournament} />
            <Route path={`${path}/:tourId`} />
        </Switch>
    )
}

export default TournamentScenes;