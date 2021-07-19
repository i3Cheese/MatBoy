import React, {FC, useEffect, useState} from 'react';
import {Route, Switch, useParams, useRouteMatch} from "react-router";
import {Tournament} from "../../types/models";
import {tournamentService} from "../../services";
import {LoaderPage} from "../../components";
import {TournamentPage} from "../../components/models/Tournament/Tournament";
import {TeamScenes} from "./TeamScenes";
import {EditTournamentFormBox, NewTournamentFormBox} from "../../components/models/Tournament/TournamentForm";

const TournamentIdScenes: FC = () => {
    const {path} = useRouteMatch();
    const {tourId: tourIdString} = useParams<{ tourId: string }>();
    const tourId = Number(tourIdString);

    const [tour, setTour] = useState<null | Tournament>(null);
    useEffect(() => {
        tournamentService.get(tourId).then((tour) => setTour(tour));
    }, [tourId]);
    if (tour === null)
        return <LoaderPage/>;
    return (
        <Switch>
            <Route
                path={path} exact
                render={(props) =>
                    <TournamentPage {...props} tour={tour}/>
                }
            />
            <Route
                path={`${path}/edit`}
                render={props => (
                    <EditTournamentFormBox {...props} tour={tour} setTour={setTour}/>
                )}
            />
            <Route
                path={`${path}/team`}
                render={props => (
                    <TeamScenes {...props} tour={tour}/>
                )}
            />
        </Switch>
    );
};

const TournamentScenes: FC = () => {
    const {path} = useRouteMatch();
    return (
        <Switch>
            <Route path={`${path}/new`} component={NewTournamentFormBox}/>
            <Route path={`${path}/:tourId`} component={TournamentIdScenes}/>
        </Switch>
    )
}
;

export default TournamentScenes;