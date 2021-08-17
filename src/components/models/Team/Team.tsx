import React, {FC} from "react";
import {Team} from "../../../types/models";
import {Link} from "react-router-dom";
import {AppLoader, Box, BoxProps, BoxTitle, DateSpan, InfoBox} from "../../layout";
import DivLink from "../../layout/DivLink";
import {leagueLink, teamLink, tourLink} from "../../../helpers/links";
import { Col } from "react-bootstrap";
import {teamStatus, teamStatusColor} from "../../../helpers";
import classnames from "classnames";

export const TeamLink: FC<{team: Team}> = ({team, children}) => (
    <Link to={teamLink(team)}>{children === undefined?team.name:children}</Link>
)


export const TeamItem: FC<{team: Team}>= ({team}) => (
    <DivLink to={teamLink(team)}>
        <h2 className="item_title">{team.name}</h2>
    </DivLink>
)

export interface TeamsBoxProps extends BoxProps {
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

export interface TeamInfoBoxProps extends BoxProps {
    team: Team | null,
}
export const TeamInfoBox: FC<TeamInfoBoxProps> = ({team, title, className, ...props}) => (
    <Box type="square" title={title || 'Информация'} border={teamStatusColor(team)} >
        {team === null ?
            <AppLoader/>
            :
            <InfoBox>
                <Col sm={3} as={"dd"}>Статус:</Col>
                <Col sm={9} as={"dt"}>{teamStatus(team)}</Col>
                <Col sm={3} as={"dd"}>Турнир:</Col>
                <Col sm={9} as={"dt"}>
                    <Link to={tourLink(team.tournament)}>
                        {team.tournament.title}
                    </Link>
                </Col>
                {team.league != null && <>
                    <Col sm={3} as={"dd"}>Лига:</Col>
                    <Col sm={9} as={"dt"}><Link to={leagueLink(team.league)}>{team.league.title}</Link></Col>
                </>}
            </InfoBox>
        }
    </Box>
)