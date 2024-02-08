/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Card } from "react-bootstrap";
import LoginForm from "../LoginForm/LoginForm";
import { updateButtonMsg } from "./loginSlice";
import "./login.css";

function Login() {
  const dispatch = useDispatch();
  const { buttonMsg, actionButtonMsg } = useSelector((state) => state.login);
  const [formData, setFormData] = useState({
    email: "",
    passwd: "",
    cnfPasswd: "",
  });

  useEffect(() => {
    handleButtonMsg();
    return () => {};
  }, []);

  const handleButtonMsg = () => {
    dispatch(updateButtonMsg());
  };

  const handleAction = (event) => {
    event.preventDefault();
    
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
