import React from "react";
import {FC} from "react";
import {Nav, Navbar, NavItem} from "react-bootstrap";
import Menu from "./Menu";
import LoginManager from "./LoginManager";
import { Link } from "react-router-dom";

const Header: FC = () => {
    return (
        <header className="">
            <Navbar bg="dark" variant="dark" expand="lg">
                <Link to="/" className="navbar-brand logo" >
                    MatBoy
                </Link>
                <Navbar.Toggle />
                <Navbar.Collapse>
                    <Menu className="mr-auto" />
                    <Nav className="mr-3">
                        <NavItem>
                            <Link to="/feedback" className="nav-link">
                                Обратная связь
                            </Link>
                        </NavItem>
                    </Nav>
                    <LoginManager >ddd</LoginManager>
                </Navbar.Collapse>
            </Navbar>
        </header>
    );
}
export default Header;
