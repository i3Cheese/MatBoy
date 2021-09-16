import React, {ComponentProps, FC} from "react";
import {User} from "../../../types/models";
import {Link, LinkProps} from "react-router-dom";
import {Box, BoxProps} from "../../layout/Box/Box";
import {AppLoader} from "../../Loader";
import DivLink from "../../layout/DivLink";
import {userLink} from "../../../helpers/links";
import './User.scss'

export interface UserLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    user: User,
}

export const UserLink: FC<UserLinkProps> = ({user, children, ...props}) => (
    <Link className={'user-link'} to={`/profile/${user.id}`} {...props}>
        {children === undefined?user.fullname:children}
    </Link>
)

export const UserMail: FC<{user: User}> = ({user, children}) => (
    <a className={'user-link'} href={`mailto:${user.email}`}>{children === undefined?user.email:children}</a>
)


export const UserItem: FC<{user: User}>= ({user}) => (
    <DivLink to={userLink(user)}>
        <h2 className="item_title">{user.name}</h2>
    </DivLink>
)

interface UsersBoxProps extends BoxProps {
    users: User[] | null,
}

export const UsersBox: FC<UsersBoxProps> = ({users, title, ...props}) => (
    <Box title={title || 'Пользователи'} {...props}>
        {users === null ?
            <AppLoader/>
            :
            users.map(user => (
                <UserItem key={user.id} user={user}/>
            ))
        }
    </Box>
)