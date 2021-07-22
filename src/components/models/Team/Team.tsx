import React, {FC} from "react";
import {Team, TeamBasics} from "../../../types/models";
import {Link} from "react-router-dom";

export const TeamLink: FC<{team: Team | TeamBasics}> = ({team, children}) => (
    <Link to={`/tournament/${team.tournament.id}/team/${team.id}`}>{children === undefined?team.name:children}</Link>
)