/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React from "react";
import { Form } from "react-bootstrap";
import "./LoginForm.css";
import { useSelector } from "react-redux";

function LoginForm({ isLogin }) {
  const { actionButtonMsg } = useSelector((state) => state.login);
  return actionButtonMsg == "Login" ? (
    <Form.Group className="mb-3 formInputGroup" controlId="loginForm.emailId">
      {/* <Form.Label>Email address</Form.Label> */}
      <Form.Control className="formControl" type="email" placeholder="Email address" />
      {/* <Form.Label>Password</Form.Label> */}
      <Form.Control type="password" placeholder="Password" />
    </Form.Group>
  ) : (
    <Form.Group className="mb-3" controlId="registerForm.emailId">
      <Form.Control className="formControl" type="email" placeholder="Email address" />
    </Form.Group>
  );
}

export default LoginForm;
