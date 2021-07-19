import React from "react";
import {FC} from "react";
import {Nav, NavProps} from "react-bootstrap";
import { Link } from "react-router-dom";

export type MenuList = [string, string][];

export interface MenuProps extends NavProps {
    menu: MenuList,
}

const Menu: FC<MenuProps> = ({menu, ...props}) => {
    return (
        <Nav {...props}>
            {menu.map(([url, name],index) => (
                <Nav.Item >
                    <Nav.Link as={Link} to={url} disabled={index === menu.length - 1}>
                        {name}
                    </Nav.Link>
                </Nav.Item>
            ))}
        </Nav>
    );
}
export default Menu;
