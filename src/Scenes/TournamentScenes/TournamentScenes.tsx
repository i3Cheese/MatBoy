import React, {ComponentProps, FC, useEffect, useState} from 'react';
import {Route, Switch, useParams, useRouteMatch} from "react-router";
import {Tournament} from "../../types/models";
import {tournamentService} from "../../services";
import {BoxContainer, LoaderPage} from "../../components";
import {TeamScenes} from "./TeamScenes";
import {EditTournamentFormBox, NewTournamentFormBox} from "../../components";
import {TournamentPage} from "./TournamentPage";
import MenuItemComponent from "../../components/MenuItemComponent";
import TournamentConsole, {TournamentConsoleProps} from "../../components/models/Tournament/TournamentConsole/TournamentConsole";
import LeagueScenes from "./LeagueScenes/LeagueScenes";


const EditTournamentPage: FC<ComponentProps<typeof EditTournamentFormBox>> = (props) => {
    return (
        <MenuItemComponent title="редактирование">
            <BoxContainer>
                <EditTournamentFormBox {...props}/>
            </BoxContainer>
        </MenuItemComponent>
    );
};

const TournamentConsolePage: FC<TournamentConsoleProps> = ({tour, ...props}) => (
    <MenuItemComponent title={"консоль"}>

        <TournamentConsole tour={tour} {...props}/>
    </MenuItemComponent>
);

const TournamentIdScenes: FC = () => {
    const {path, url} = useRouteMatch();
    const {tourId: tourIdString} = useParams<{ tourId: string }>();
    const tourId = Number(tourIdString);

    const [tour, setTour] = useState<null | Tournament>(null);
    useEffect(() => {
        tournamentService.get(tourId).then((tour) => setTour(tour));
    }, [tourId]);
    if (tour === null)
        return <LoaderPage/>;
    return (
        <MenuItemComponent title={tour.title}>
            <Switch>
                <Route path={path} exact>
                    <TournamentPage tour={tour}/>
                </Route>
                <Route path={`${path}/edit`}>
                    <EditTournamentPage tour={tour} setTour={setTour}/>
                </Route>
                <Route path={`${path}/console`}>
                    <TournamentConsolePage tour={tour}/>
                </Route>
                <Route
                    path={`${path}/team`}
                    render={props => (
                        <TeamScenes {...props} tour={tour}/>
                    )}
                />
                <Route path={`${path}/league`}>
                    <LeagueScenes tour={tour}/>
                </Route>
            </Switch>
        </MenuItemComponent>
    );
};

const TournamentScenes: FC = () => {
        const {path} = useRouteMatch();
        return (
            <Switch>
                <Route path={`${path}/new`}>
                    <BoxContainer>
                        <NewTournamentFormBox/>
                    </BoxContainer>
                </Route>
                <Route path={`${path}/:tourId`} component={TournamentIdScenes}/>
            </Switch>
        )
    }
;

export default TournamentScenes;