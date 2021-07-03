import React from "react";
import {FC} from "react";
import {Nav, Navbar, NavItem, NavLink} from "react-bootstrap";
import Menu from "./Menu";
import LoginManager from "./LoginManager";

const Header: FC<{}> = props => {
    return (
        <header className="">
            <Navbar bg="dark" variant="dark" expand="lg">
                <Navbar.Brand className="logo" href="/">
                    MatBoy
                </Navbar.Brand>
                <Navbar.Toggle />
                <Navbar.Collapse>
                    <Menu />
                    <Nav className="mr-3">
                        <NavItem>
                            <NavLink href="{{ url_for('web_pages.feedback') }}">
                                Обратная связь
                            </NavLink>
                        </NavItem>
                    </Nav>
                    <LoginManager />
                </Navbar.Collapse>
            </Navbar>
        </header>
    );
}
export default Header;
