import React from "react";
import {FC} from "react";
import {Container, Nav, Navbar, NavItem} from "react-bootstrap";
import LoginManager from "./LoginManager";
import {Link} from "react-router-dom";
import Menu from "./Menu";

const Header: FC = ({}) => {
    return (
        <header className="">
            <Navbar bg="dark" variant="dark" expand="lg">
                <Container fluid>
                    <Link to="/" className="navbar-brand logo">
                        MatBoy
                    </Link>
                    <Navbar.Toggle/>
                    <Navbar.Collapse>
                        <Menu className="me-auto"/>
                        <Nav className="me-3">
                            <NavItem>
                                <Link to="/feedback" className="nav-link">
                                    Обратная связь
                                </Link>
                            </NavItem>
                        </Nav>
                        <LoginManager>ddd</LoginManager>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </header>
    );
}
export default Header;
