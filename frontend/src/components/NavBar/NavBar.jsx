/* eslint-disable react/prop-types */
import "./NavBar.css";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import UserAvatar from "../UserAvatar/UserAvatar";
// import { useEffect, useState } from "react";

function NavBar({ loggedIn, setLoggedIn }) {
  console.log(`LoggedIn in Nav ==> `, loggedIn);
  // const handleLogout = () => {
  //   Cookies.remove("jwt");
  //   setLoggedIn(false);
  // };

  return (
    <Navbar
      collapseOnSelect
      expand="lg"
      style={{ backgroundSize: "0", backgroundColor: "#292C33" }}
      sticky="top"
    >
      <Container>
        <Navbar.Brand>
          <text>RNFT</text>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav>
            <Nav.Link href="/">Home</Nav.Link>
            <Nav.Link href="/collections">Collections</Nav.Link>
            {loggedIn ? (
              // <Nav.Link href="/" onClick={handleLogout}>
              //   Logout
              // </Nav.Link>
              <UserAvatar username="John Doe" size={50}></UserAvatar>
            ) : (
              <Nav.Link href="/login">Login</Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;
