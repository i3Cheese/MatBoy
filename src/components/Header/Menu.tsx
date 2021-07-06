import React from "react";
import {FC} from "react";
import {Nav, NavProps} from "react-bootstrap";

interface MenuProps extends NavProps {
}

const Menu: FC<MenuProps> = props => {
    return (
        //TODO: DO MENU
        <Nav {...props}>
        </Nav>
    );
}
export default Menu;
