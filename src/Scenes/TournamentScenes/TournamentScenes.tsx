import React, {ComponentProps, FC} from 'react';
import {Route, useParams, useRouteMatch} from "react-router";
import {BoxContainer, LoaderPage, SwitchWith404, Restricted, ErrorHandler} from "../../components";
import {TeamScenes} from "./TeamScenes";
import {EditTournamentFormBox, NewTournamentFormBox} from "../../components";
import {TournamentPage} from "./TournamentPage";
import MenuItemComponent from "../../components/MenuItemComponent";
import TournamentConsole, {TournamentConsoleProps} from "../../components/models/Tournament/TournamentConsole/TournamentConsole";
import LeagueScenes from "./LeagueScenes/LeagueScenes";
import {useTournament} from "../../helpers/hooks";


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
        <Restricted access={tour.full_access}>
            <TournamentConsole tour={tour} {...props}/>
        </Restricted>
    </MenuItemComponent>
);

const TournamentIdScenes: FC = () => {
    const {path} = useRouteMatch();
    const {tourId: tourIdString} = useParams<{ tourId: string }>();
    const tourId = Number(tourIdString);
    const [tour, error, setTour] = useTournament(tourId);

    if (error != null) return <ErrorHandler error={error}/>
    if (tour === null) return <LoaderPage/>;
    return (
        <MenuItemComponent title={tour.title}>
            <SwitchWith404>
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
            </SwitchWith404>
        </MenuItemComponent>
    );
};

const TournamentScenes: FC = () => {
    const {path} = useRouteMatch();
    return (
        <SwitchWith404>
            <Route path={`${path}/new`}>
                <BoxContainer>
                    <NewTournamentFormBox/>
                </BoxContainer>
            </Route>
            <Route path={`${path}/:tourId`} component={TournamentIdScenes}/>
        </SwitchWith404>
    )
};

export default TournamentScenes;
