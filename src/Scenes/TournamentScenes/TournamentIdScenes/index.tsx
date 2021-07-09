import React, {FC} from 'react';
import {Route, Switch, useRouteMatch} from "react-router";

const TournamentIdScenes: FC = () => {
    const {path, url} = useRouteMatch();
    return (
        <Switch>
            <Route path={path} exact>

            </Route>
        </Switch>
    )
}

export default TournamentIdScenes;
