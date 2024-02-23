/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Card } from "react-bootstrap";
import LoginForm from "../LoginForm/LoginForm";
import { updateButtonMsg } from "./loginSlice";
import "./login.css";
import { useMutation } from "@apollo/client";
import { GET_USER } from "../../mutations/Mutation";
import { useNavigate } from "react-router-dom";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { buttonMsg, actionButtonMsg } = useSelector((state) => state.login);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    cnfPasswd: "",
  });

  const [loginUser, { data, error }] = useMutation(GET_USER);

  useEffect(() => {
    handleButtonMsg();
    return () => {};
  }, []);

  const handleButtonMsg = () => {
    dispatch(updateButtonMsg());
  };

  const handleAction = async (event) => {
    event.preventDefault();
    try {
      const { data } = await loginUser({
        variables: {
          email: formData.email,
          password: formData.password,
          operation: actionButtonMsg,
        },
      });
      if (data.users.email !== null) {
        window.localStorage.setItem("users", JSON.stringify(data.users));
        console.log(window.localStorage.getItem("users"));
        return navigate('/collections')
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <div className="loginContainer">
      <Card className="loginCard">
        <Card.Title className="d-grid gap-2">
          <Button size="lg" onClick={handleButtonMsg}>
            {buttonMsg}
          </Button>
        </Card.Title>
        <Card.Body>
          <LoginForm setFormData={setFormData} />
        </Card.Body>
        <Card.Footer className="text-muted">
          <Button className="loginButtons" onClick={handleAction} type="submit">
            {actionButtonMsg}
          </Button>
        </Card.Footer>
      </Card>
    </div>
  );
}

export default Login;
