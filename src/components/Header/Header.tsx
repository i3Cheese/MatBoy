import React from "react";
import {FC} from "react";
import {Container, Nav, Navbar, NavItem} from "react-bootstrap";
import Menu, {MenuList} from "./Menu";
import LoginManager from "./LoginManager";
import {Link} from "react-router-dom";

const Header: FC<{menu?: MenuList}> = ({menu}) => {
    return (
        <header className="">
            <Navbar bg="dark" variant="dark" expand="lg">
                <Container fluid>
                    <Link to="/" className="navbar-brand logo">
                        MatBoy
                    </Link>
                    <Navbar.Toggle/>
                    <Navbar.Collapse>
                        {menu && <Menu className="me-auto" menu={menu}/>}
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
export {MenuList};
export default Header;
