import React, {FC, useEffect, useState} from 'react';
import {Route, Switch, useParams, useRouteMatch} from "react-router";
import {Team, Tournament} from "../../../types/models";
import {BoxContainer, LoaderPage, NewTeamFormBox} from "../../../components";
import {teamServices} from "../../../services";

const TeamIdScenes: FC<{tour: Tournament}> = ({tour}) => {
    const {path} = useRouteMatch();
    const {teamId: teamIdString} = useParams<{teamId: string, tourId: string}>();
    const teamId = parseInt(teamIdString);
    const [team, setTeam] = useState<Team | null>(null);
    useEffect(()=>{
        teamServices.get(teamId).then(setTeam);
    }, [teamId]);
    if (team === null) return <LoaderPage/>
    return (
        <Switch>
            <Route path={path} exact render={(...props) => (
                team.name
            )}/>
        </Switch>
    )
}

const TeamScenes: FC<{tour: Tournament}> = ({tour, ...props}) => {
    const {path} = useRouteMatch();
    return (
        <Switch>
            <Route path={`${path}/new`}>
                <BoxContainer>
                    <NewTeamFormBox tour={tour}/>
                </BoxContainer>
            </Route>
            <Route path={`${path}/:teamId`} render={(...props) => (
                <TeamIdScenes tour={tour} {...props}/>
            )}/>
        </Switch>
    );
}

export default TeamScenes;