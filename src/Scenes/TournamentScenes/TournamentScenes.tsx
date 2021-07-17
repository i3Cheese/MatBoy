import React, {FC, useEffect, useState} from 'react';
import {Route, Switch, useParams, useRouteMatch} from "react-router";
import NewTournament from "./NewTournament";
import TournamentId from "./TournamentId";
import {Tournament} from "../../types/models";
import {tournamentService} from "../../services";
import EditTournament from "./EditTournament";
import Loader from "react-loader-spinner";

const TournamentIdScenes: FC = () => {
    const {path, url} = useRouteMatch();
    const {tourId: tourIdString} = useParams<{ tourId: string }>();
    const tourId = Number(tourIdString);

    const [tour, setTour] = useState<null | Tournament>(null);
    useEffect(() => {
        tournamentService.get(tourId).then((tour) => setTour(tour));
    }, [tourId]);
    if (tour === null)
        return <Loader type="Circles"/>;
    return (
        <Switch>
            <Route
                path={path} exact
                render={(props) =>
                    <TournamentId {...props} tour={tour}/>
                }
            />
            <Route
                path={`${path}/edit`}
                render={props => (
                    <EditTournament {...props} tour={tour} setTour={setTour}/>
                )}
            />
        </Switch>
    );
};

const TournamentScenes: FC = () => {
    const {path, url} = useRouteMatch();
    return (
        <Switch>
            <Route path={`${path}/new`} component={NewTournament}/>
            <Route path={`${path}/:tourId`} component={TournamentIdScenes}/>
        </Switch>
    )
};

export default TournamentScenes;