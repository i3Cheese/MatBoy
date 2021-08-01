import React, {FC, useEffect, useState} from "react";
import {League, Team, Tournament} from "../../../types/models";
import {Route, Switch, useParams, useRouteMatch} from "react-router";
import MenuItemComponent from "../../../components/MenuItemComponent";
import {BoxContainer, LoaderPage, NewTeamFormBox} from "../../../components";
import {leagueServices, teamServices} from "../../../services";
import LeagueConsole from "../../../components/models/League/LeagueConsole";


const LeagueIdScenes: FC<{tour: Tournament}> = ({tour}) => {
    const {path} = useRouteMatch();
    const {leagueId: teamIdString} = useParams<{leagueId: string, tourId: string}>();
    const leagueId = parseInt(teamIdString);
    const [league, setLeague] = useState<League | null>(null);
    useEffect(()=>{
        leagueServices.get(leagueId).then(setLeague);
    }, [leagueId]);
    if (league === null) return <LoaderPage/>
    return (
        <MenuItemComponent title={league.title}><Switch>
            <Route path={path} exact>
                {league.title}
            </Route>
            <Route path={`${path}/console`}>
                <MenuItemComponent title="Консоль">
                    <LeagueConsole tour={tour} league={league}/>
                </MenuItemComponent>
            </Route>
        </Switch></MenuItemComponent>
    )
}

const LeagueScenes: FC<{tour: Tournament}> = ({tour, ...props}) => {
    const {path} = useRouteMatch();
    return (
        <Switch>
            <Route path={`${path}/:leagueId`}>
                <LeagueIdScenes tour={tour} {...props}/>
            </Route>
        </Switch>
    );
}
export default LeagueScenes;