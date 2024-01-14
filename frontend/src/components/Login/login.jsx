/* eslint-disable no-unused-vars */
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Card } from "react-bootstrap";
import LoginForm from "../LoginForm/LoginForm";
import { updateButtonMsg } from "./loginSlice";
import "./login.css";

function Login() {
  const dispatch = useDispatch();
  const { buttonMsg, actionButtonMsg } = useSelector((state) => state.login);

  useEffect(() => {
    handleButtonMsg();
    return () => {
      
    }
  }, [])
  

  const handleButtonMsg = () => {
    dispatch(updateButtonMsg());
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
          <LoginForm />
        </Card.Body>
        <Card.Footer className="text-muted">
          <Button className="loginButtons" onClick={() => console.log(`${actionButtonMsg} here`)}>
            {actionButtonMsg}
          </Button>
        </Card.Footer>
      </Card>
    </div>
  );
}

export default Login;