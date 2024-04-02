/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./LoginForm.css";
import { addRegister } from "./formInput";
import { DialogContent, DialogContentText, TextField } from "@mui/material";

function LoginForm({ setFormData }) {
  const dispatch = useDispatch();
  const { actionButtonMsg } = useSelector((state) => state.login);

  const handleChange = (e) => {
    if (["regEmail", "loginEmail"].includes(e.target.name)) {
      setFormData((formData) => {
        return { ...formData, email: e.target.value };
      });
    } else if (["regPasswd", "loginPasswd"].includes(e.target.name)) {
      setFormData((formData) => {
        return { ...formData, password: e.target.value };
      });
    } else if (e.target.name === "regCnfPasswd") {
      setFormData((formData) => {
        return { ...formData, cnfPasswd: e.target.value };
      });
    } else if (e.target.name === "regFirstName") {
      setFormData((formData) => {
        return { ...formData, firstName: e.target.value };
      });
    } else if (e.target.name === "regLastName") {
      setFormData((formData) => {
        return { ...formData, lastName: e.target.value };
      });
    }
  };

  return actionButtonMsg == "Login" ? (
    <DialogContent>
      {/* <DialogContentText>
        To subscribe to this website, please enter your email address here. We
        will send updates occasionally.
      </DialogContentText> */}
      <TextField
        autoFocus
        required
        margin="dense"
        id="email"
        name="loginEmail"
        label="Email Address"
        type="email"
        fullWidth
        variant="standard"
        onChange={(event) => {
          event.preventDefault();
          handleChange(event);
        }}
      />
      <TextField
        autoFocus
        required
        margin="dense"
        id="password"
        label="Password"
        type="password"
        fullWidth
        variant="standard"
        name="loginPasswd"
        onChange={(event) => {
          event.preventDefault();
          handleChange(event);
        }}
      />
    </DialogContent>
  ) : (
    <DialogContent>
      <TextField
        autoFocus
        required
        margin="dense"
        id="regFirstName"
        label="First Name"
        type="text"
        fullWidth
        variant="standard"
        name="regFirstName"
        onChange={(event) => {
          event.preventDefault();
          handleChange(event);
        }}
      />
      <TextField
        autoFocus
        required
        margin="dense"
        id="regLastName"
        label="Last Name"
        type="text"
        fullWidth
        variant="standard"
        name="regLastName"
        onChange={(event) => {
          event.preventDefault();
          handleChange(event);
        }}
      />
      <TextField
        autoFocus
        required
        margin="dense"
        id="regEmail"
        label="Email address"
        type="email"
        fullWidth
        variant="standard"
        name="regEmail"
        onChange={(event) => {
          event.preventDefault();
          handleChange(event);
        }}
      />
      <TextField
        autoFocus
        required
        margin="dense"
        id="regPasswd"
        label="Password"
        type="password"
        fullWidth
        variant="standard"
        name="regPasswd"
        onChange={(event) => {
          event.preventDefault();
          handleChange(event);
        }}
      />
      <TextField
        autoFocus
        required
        margin="dense"
        id="regCnfPasswd"
        label="Confirm Password"
        type="passworf"
        fullWidth
        variant="standard"
        name="regCnfPasswd"
        onChange={(event) => {
          event.preventDefault();
          handleChange(event);
        }}
      />
    </DialogContent>
  );
}

export default LoginForm;
