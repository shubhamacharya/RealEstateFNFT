/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState } from "react";
import { Form } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import "./LoginForm.css";
import { addRegister } from "./formInput";

function LoginForm({ setFormData }) {
  const dispatch = useDispatch();
  const { form } = useSelector((state) => state.registerForm);
  const { actionButtonMsg } = useSelector((state) => state.login);

  const handleChange = (e) => {
    if (["regEmail", "loginEmail"].includes(e.target.name)) {
      setFormData((formData) => {
        return { ...formData, email: e.target.value };
      });
    } else if (["regPasswd", "loginPasswd"].includes(e.target.name)) {
      setFormData((formData) => {
        return { ...formData, passwd: e.target.value };
      });
    } else if (e.target.name === "regCnfPasswd") {
      setFormData((formData) => {
        return { ...formData, cnfPasswd: e.target.value };
      });
    }
  };

  return actionButtonMsg == "Login" ? (
    <Form.Group className="mb-3 formInputGroup">
      {/* <Form.Label>Email address</Form.Label> */}
      <Form.Control
        className="formControl"
        type="email"
        placeholder="Email address"
        name="loginEmail"
        onChange={(event) => {
          event.preventDefault();
          handleChange(event);
        }}
      />
      {/* <Form.Label>Password</Form.Label> */}
      <Form.Control
        type="password"
        placeholder="Password"
        name="loginPasswd"
        onChange={(event) => {
          event.preventDefault();
          handleChange(event);
        }}
      />
    </Form.Group>
  ) : (
    <Form.Group className="mb-3">
      <Form.Control
        className="formControl"
        type="email"
        placeholder="Email address"
        name="regEmail"
        onChange={(event) => {
          event.preventDefault();
          handleChange(event);
        }}
      />
      <Form.Control
        type="password"
        className="formControl"
        placeholder="Password"
        name="regPasswd"
        onChange={(event) => {
          event.preventDefault();
          handleChange(event);
        }}
      />
      <Form.Control
        type="password"
        placeholder="Confirm Password"
        name="regCnfPasswd"
        onChange={(event) => {
          event.preventDefault();
          handleChange(event);
        }}
      />
    </Form.Group>
  );
}

export default LoginForm;
