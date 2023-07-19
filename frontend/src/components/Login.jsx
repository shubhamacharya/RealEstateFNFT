import React, { useState } from "react";
import { Card, Form, Button } from "react-bootstrap";
import { useMutation } from "@apollo/client";
import { GET_USER } from "../mutations/Mutation.js";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loginUser] = useMutation(GET_USER);
  const handleLogin = async () => {
    if (email === "" || password === "") {
      alert("Please fill all the fields");
    } else {
      let res = await loginUser({
        variables: { email: email, password: password },
      });
      localStorage.setItem("role",res.data.users.role);
      navigate("/home", { state: { role: res.data.users.role } });
    }
  };
  return (
    <Card
      className="position-absolute top-50 start-50 translate-middle"
      style={{ width: "25rem" }}
    >
      <Card.Header className="text-center ">Login</Card.Header>
      <Card.Body>
        <Form
          onSubmit={async (e) => {
            e.preventDefault();
            handleLogin();
          }}
        >
          <Form.Group className="mb-3 sm" controlId="loginInputEmail">
            <Form.Label>Email address</Form.Label>
            <Form.Control
              type="email"
              placeholder="name@example.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="loginInputPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter your password here."
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>
          <Button variant="primary" type="submit">
            Primary
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}
