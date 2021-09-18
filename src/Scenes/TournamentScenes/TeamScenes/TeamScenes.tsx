import React, {FC} from 'react';
import {Route, useParams, useRouteMatch} from "react-router";
import {Tournament} from "../../../types/models";
import {BoxContainer, ErrorHandler, LoaderPage, NewTeamFormBox, SwitchWith404} from "../../../components";
import MenuItemComponent from "../../../components/MenuItemComponent";
import {TeamPage} from "./TeamPage";
import {useTeam} from "../../../helpers/hooks";

const TeamIdScenes: FC<{tour: Tournament}> = ({}) => {
    const {path} = useRouteMatch();
    const {teamId: teamIdString} = useParams<{teamId: string, tourId: string}>();
    const teamId = parseInt(teamIdString);
    const [team, error] = useTeam(teamId);

    if (error) return <ErrorHandler error={error}/>
    if (team === null) return <LoaderPage/>
    return (
        <MenuItemComponent title={team.name}><SwitchWith404>
            <Route path={path} exact>
                <TeamPage team={team}/>
            </Route>
        </SwitchWith404></MenuItemComponent>
    )
}

const TeamScenes: FC<{tour: Tournament}> = ({tour}) => {
    const {path} = useRouteMatch();
    return (
        <SwitchWith404>
            <Route path={`${path}/new`}>
                <MenuItemComponent title={"командная заявка"}>
                    <BoxContainer>
                        <NewTeamFormBox tour={tour}/>
                    </BoxContainer>
                </MenuItemComponent>
            </Route>
            <Route path={`${path}/:teamId`} render={(...props) => (
                <TeamIdScenes tour={tour} {...props}/>
            )}/>
        </SwitchWith404>
    );
}

export default TeamScenes;