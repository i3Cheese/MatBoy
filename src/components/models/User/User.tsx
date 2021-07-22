import React, {FC} from "react";
import {User} from "../../../types/models";
import {Link} from "react-router-dom";

export const UserLink: FC<{user: User}> = ({user, children}) => (
    <Link to={`/profile/${user.id}`}>{children === undefined?user.fullname:children}</Link>
)

export const UserMail: FC<{user: User}> = ({user, children}) => (
    <a href={`mailto:${user.email}`}>{children === undefined?user.email:children}</a>
)