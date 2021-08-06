import React, {FC} from "react";
import {Team} from "../../../types/models";
import {Link} from "react-router-dom";
import {AppLoader, Box, BoxProps} from "../../layout";
import DivLink from "../../layout/DivLink";
import {teamLink} from "../../../helpers/links";

export const TeamLink: FC<{team: Team}> = ({team, children}) => (
    <Link to={teamLink(team)}>{children === undefined?team.name:children}</Link>
)


export const TeamItem: FC<{team: Team}>= ({team}) => (
    <DivLink to={teamLink(team)}>
        <h2 className="item_title">{team.name}</h2>
    </DivLink>
)

interface TeamsBoxProps extends BoxProps {
    teams: Team[] | null,
}

export const TeamsBox: FC<TeamsBoxProps> = ({teams, title, ...props}) => (
    <Box size='tiny' title={title || 'Команды'} {...props}>
        {teams === null ?
            <AppLoader/>
            :
            teams.map(team => (
                <TeamItem key={team.id} team={team}/>
            ))
        }
    </Box>
)