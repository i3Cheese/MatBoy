import React from "react";
import {FC} from "react";
import {Nav, NavProps} from "react-bootstrap";
import { Link } from "react-router-dom";
import {useSelector} from "react-redux";
import {AppState} from "../../store";

export type MenuList = [string, string][];

export interface MenuProps extends NavProps {
}

const Menu: FC<MenuProps> = ({...props}) => {
    const items = useSelector<AppState, MenuList>(({menu}) => menu.items);
    return (
        <Nav {...props}>
            {items.map(([url, name],index) => (
                <Nav.Item key={url}>
                    <Nav.Link as={Link} to={url} disabled={index === items.length - 1}>
                        {name}
                    </Nav.Link>
                </Nav.Item>
            ))}
        </Nav>
    );
}
export default Menu;
