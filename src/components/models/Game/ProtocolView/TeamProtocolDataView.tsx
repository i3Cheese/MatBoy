import React, {FC} from 'react';
import {Link} from 'react-router-dom';
import {Protocol, Team, TeamProtocolData, User} from "../../../../types/models";
import {userLink} from "../../../../helpers/links";

import "./TeamProtocolDataView.scss";
import {UserSelect} from "../../User";
import {Form} from "react-bootstrap";

export const TeamProtocolDataViewContainer: FC = ({children}) => (
    <div className={"TeamProtocolDataViewContainer"}>
        {children}
    </div>
)


export interface TeamProtocolDataViewProps {
    team: Team,
    team_data: TeamProtocolData,
}

export const TeamProtocolDataView: FC<TeamProtocolDataViewProps> = (
    {
        team,
        team_data,
    }) => (
    <div className={"TeamProtocolDataView"}>
        <h4 className={"TeamProtocolDataView__header"}>
            {team.name}
        </h4>
        <ol className={"TeamProtocolDataView__list"}>
            {team_data.captain && <PlayerBlock user={team_data.captain} rank={"captain"}/>}
            {team_data.deputy && team_data.captain?.id != team_data.deputy?.id && <PlayerBlock user={team_data.deputy} rank={"deputy"}/>}
            {team.players.map((player) => (
                (player.id == team_data.captain?.id || player.id == team_data.deputy?.id)
                    ? undefined
                    : <PlayerBlock user={player}/>
            ))}
        </ol>
    </div>
);

export interface TeamProtocolDataEditProps {
    team: Team,
    path: string,
}

export const TeamProtocolDataEdit: FC<TeamProtocolDataEditProps> = ({team, path}) => (
    <div className={"TeamProtocolDataView"}>
        <h4 className={"TeamProtocolDataView__header"}>
            {team.name}
        </h4>
        <ol className={"TeamProtocolDataView__list"}>
            {team.players.map((player) => (
                <PlayerBlock user={player} key={player.id}/>
            ))}
        </ol>
        <div className="TeamProtocolDataView__filler"/>
        <div className={"TeamProtocolDataView__selects"}>
            <Form.Group className={"TeamProtocolDataView__selects__group"}>
                <Form.Label>Капитан:</Form.Label>
                <UserSelect path={`${path}.captain`} users={team.players} />
            </Form.Group>
            <Form.Group className={"TeamProtocolDataView__selects__group"}>
                <Form.Label>Заместитель:</Form.Label>
                <UserSelect path={`${path}.deputy`} users={team.players} />
            </Form.Group>
        </div>
    </div>
);



const PlayerBlock: FC<{ user: User, rank?: "captain" | "deputy" }> = ({user, rank}) => (
    <li className={"TeamProtocolDataView__list__player"}>
        <Link to={userLink(user)} className={"TeamProtocolDataView__list__player__link"}>{user.fullname}</Link>
        {rank && <span className={"TeamProtocolDataView__list__player__rank"}>
            {rank === "captain" ? "Капитан" : "Заместитель"}
        </span>}
    </li>
)
