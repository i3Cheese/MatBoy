import React, {FC} from "react";
import {League} from "../../../types/models";
import {useRouteMatch} from "react-router";
import PageHeader from "../../../components/PageHeader";
import SimpleMenu from "../../../components/SimpleMenu";
import {BoxContainer, TeamsBox} from "../../../components";
import {useGames, useTeams} from "../../../helpers/hooks";
import {GamesBox} from "../../../components";

export const LeaguePage: FC<{league: League}> = ({league}) => {
    const {url} = useRouteMatch();
    const [teams] = useTeams(undefined, league.id);
    const [games] = useGames(league.id);
    return (
        <>
            <PageHeader>
                <PageHeader.Title>
                    {league.title}
                </PageHeader.Title>
                <SimpleMenu>
                    {league.manage_access && [
                        <SimpleMenu.Link to={`${url}/console`} key='console'>управлять</SimpleMenu.Link>,
                    ]}
                </SimpleMenu>
            </PageHeader>
            <BoxContainer reverseWrap covid>
                <TeamsBox teams={teams}/>
                <GamesBox games={games}/>
            </BoxContainer>
        </>
    );
}
