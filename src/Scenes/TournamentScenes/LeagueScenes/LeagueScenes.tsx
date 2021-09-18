import React, {FC} from "react";
import {Tournament} from "../../../types/models";
import {Route, useParams, useRouteMatch} from "react-router";
import MenuItemComponent from "../../../components/MenuItemComponent";
import {ErrorHandler, LoaderPage, Restricted, SwitchWith404} from "../../../components";
import LeagueConsole from "../../../components/models/League/LeagueConsole";
import {LeaguePage} from "./LeaguePage";
import GameScenes from "./GameScenes/GameScenes";
import {useLeague} from "../../../helpers/hooks";


const LeagueIdScenes: FC<{tour: Tournament}> = ({tour}) => {
    const {path} = useRouteMatch();
    const {leagueId: teamIdString} = useParams<{leagueId: string, tourId: string}>();
    const leagueId = parseInt(teamIdString);
    const [league, error] = useLeague(leagueId);
    if (error) return <ErrorHandler error={error}/>
    if (league === null) return <LoaderPage/>
    return (
        <MenuItemComponent title={league.title}><SwitchWith404>
            <Route path={path} exact>
                <LeaguePage league={league}/>
            </Route>
            <Route path={`${path}/console`}>
                <MenuItemComponent title="Консоль"><Restricted access={league.manage_access}>
                    <LeagueConsole tour={tour} league={league}/>
                </Restricted></MenuItemComponent>
            </Route>
            <Route path={`${path}/game`}>
                <GameScenes tour={tour} league={league}/>
            </Route>
        </SwitchWith404></MenuItemComponent>
    )
}

const LeagueScenes: FC<{tour: Tournament}> = ({tour, ...props}) => {
    const {path} = useRouteMatch();
    return (
        <SwitchWith404>
            <Route path={`${path}/:leagueId`}>
                <LeagueIdScenes tour={tour} {...props}/>
            </Route>
        </SwitchWith404>
    );
}
export default LeagueScenes;