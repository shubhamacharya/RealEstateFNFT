import React from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import { useLocation } from "react-router-dom";

function NavBar() {
  let location = useLocation();
  return (
    <Navbar bg="dark" data-bs-theme="dark" sticky="top">
      <Container>
        <Navbar.Brand href="#home">Navbar</Navbar.Brand>
        <Nav className="me-auto">
          <Nav.Link href="/home">Home</Nav.Link>
          {location?.state?.role === "admin" && (
            <Nav.Link href="/mint">Mint</Nav.Link>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
}

export default NavBar;
