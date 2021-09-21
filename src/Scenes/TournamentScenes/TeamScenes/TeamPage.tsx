import React, {FC} from "react";
import {Team} from "../../../types/models";
import {useRouteMatch} from "react-router";
import PageHeader from "../../../components/PageHeader";
import SimpleMenu from "../../../components/SimpleMenu";
import {BoxContainer, TeamInfoBox} from "../../../components";
import {UsersBox} from "../../../components";
import {GamesBox} from "../../../components";
import {useGames} from "../../../helpers/hooks";

export const TeamPage: FC<{team: Team}> = ({team}) => {
    const {url} = useRouteMatch();
    const [games] = useGames(undefined, team.id)
    return (
        <>
            <PageHeader>
                <PageHeader.Title>
                    {team.name}
                </PageHeader.Title>
                <SimpleMenu>
                    {team.manage_access && [
                        <SimpleMenu.Link to={`${url}/edit`} key='edit'>редактировать</SimpleMenu.Link>
                    ]}
                </SimpleMenu>
            </PageHeader>
            <BoxContainer fluid={"md"} reverseWrap>
                <TeamInfoBox team={team}/>
                <UsersBox users={team.players} title='Сотстав команды'/>
                <GamesBox games={games}/>
            </BoxContainer>
        </>
    );
}