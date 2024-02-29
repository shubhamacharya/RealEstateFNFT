/* eslint-disable react/prop-types */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Card } from "react-bootstrap";
import LoginForm from "../LoginForm/LoginForm";
import { updateButtonMsg } from "./loginSlice";
import "./login.css";
import { GET_USER } from "../../mutations/Mutation";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";

function Login({setLoggedIn}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { buttonMsg, actionButtonMsg } = useSelector((state) => state.login);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    cnfPasswd: "",
  });

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
      const {
        data: { data },
      } = await axios({
        method: "post",
        url: process.env.REACT_APP_GRAPHQL_URL,
        data: {
          query: GET_USER,
          variables: {
            email: formData.email,
            password: formData.password,
            operation: actionButtonMsg,
          },
        },
      });
      if (data.users.email !== null && actionButtonMsg === "Login") {
        // window.localStorage.setItem("users", JSON.stringify(data.users.token));
        Cookies.set("jwt", JSON.stringify(data.users.token), {
          expires: 0.0416667,
        });
        setLoggedIn(true);
        return navigate("/home");
      } else {
        return navigate("/login");
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
