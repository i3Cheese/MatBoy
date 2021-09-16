import React, {FC} from "react";
import {Team, User} from "../../../types/models";
import {Link} from "react-router-dom";
import {AppLoader, Box, BoxProps, InfoBox} from "../../layout";
import DivLink from "../../layout/DivLink";
import {leagueLink, teamLink, tourLink} from "../../../helpers/links";
import {Col, Form} from "react-bootstrap";
import {teamStatus, teamStatusColor} from "../../../helpers";
import {Control, Controller} from "react-hook-form";

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
export const TeamInfoBox: FC<TeamInfoBoxProps> = ({team, title, border, ...props}) => (
    <Box type="square" title={title || 'Информация'} border={border || teamStatusColor(team)} {...props}>
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


export const TeamSelect: FC<{ control?: Control<any>, path: string, teams: Team[] }> = (
    {control, path, teams, ...props}) => (
    <Controller
        control={control}
        name={`${path}.id`}
        render={({field, fieldState}) => (
            <Form.Select {...props} {...field} isInvalid={fieldState.invalid}>
                <option/>
                {teams.map((team, i) => (
                    <option value={team.id} key={team.id}>
                        {team.name}
                    </option>
                ))}
            </Form.Select>
        )}
    />
)
