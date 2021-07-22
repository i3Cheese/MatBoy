import React from "react";
import {FC} from "react";
import {Nav, NavProps} from "react-bootstrap";
import { Link } from "react-router-dom";
import {useSelector} from "react-redux";
import {AppState} from "../../store";


export interface MenuProps extends NavProps {
}


const Menu: FC<MenuProps> = ({...props}) => {
    const items = useSelector<AppState, AppState["menu"]["items"]>(({menu}) => menu.items);
    return (
        <Nav {...props}>
            {items.map(({url, title}, index) => (
                <Nav.Item key={url}>
                    <Nav.Link as={Link} to={url}>
                        {title}
                    </Nav.Link>
                </Nav.Item>
            ))}
        </Nav>
    );
}
export default Menu;
