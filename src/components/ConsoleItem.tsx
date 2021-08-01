import React, {ComponentProps, FC, ReactNode} from "react";
import {User} from "../types/models";
import {Button, ButtonGroup, ListGroup, ListGroupItemProps, ListGroupProps} from "react-bootstrap";
import {UserLink, UserMail} from "./models/User";

export const ListGroupUserData: FC<{ user: User } & ListGroupProps> = ({user, ...props}) => (
    <ListGroup horizontal {...props}>
        <ListGroup.Item className="flex-fill">
            <UserLink user={user}/>
        </ListGroup.Item>
        <ListGroup.Item className="flex-fill">
            <UserMail user={user}/>
        </ListGroup.Item>
    </ListGroup>
)


export const TitledItem: FC<{ label: ReactNode } & ListGroupItemProps> = ({label, children, ...props}) => (
    <>
        <ListGroup.Item variant="secondary">
            {label}
        </ListGroup.Item>
        <ListGroup.Item {...props}>
            {children}
        </ListGroup.Item>
    </>
)

export const ButtonGroupItem: FC = ({children}) => (
    <ListGroup.Item style={{padding: 0}}><ButtonGroup className="w-100">
        {children}
    </ButtonGroup></ListGroup.Item>
)