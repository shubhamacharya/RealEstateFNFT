import React from "react";
import { Button, Container, Nav, Navbar } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import { connect } from "../utils/walletConnect";

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
          <Nav.Link href="/myCollection">Collection</Nav.Link>
          {localStorage.getItem("account") ? (
            <Navbar.Text>{localStorage.getItem("account")}</Navbar.Text>
          ) : (
            <Button onClick={connect}></Button>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
}

export default NavBar;
