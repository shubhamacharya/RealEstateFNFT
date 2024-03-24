// /* eslint-disable react/prop-types */
// /* eslint-disable no-undef */
// /* eslint-disable no-unused-vars */
import * as React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { updateButtonMsg } from "./loginSlice";
import LoginForm from "../LoginForm/LoginForm";
import axios from "axios";
import { GET_USER } from "../../mutations/Mutation";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const Login = ({ setLoggedIn }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  React.useEffect(() => {}, []);

  const [openLogin, setOpenLogin] = React.useState(false);
  const { actionButtonMsg } = useSelector((state) => state.login);
  const [swichLabel, setSwichLabel] = React.useState("end");
  const [formData, setFormData] = React.useState({
    email: "",
    password: "",
    cnfPasswd: "",
    firstName: "",
    lastName: "",
  });

  const handleOpenLogin = () => {
    dispatch(updateButtonMsg());
    setOpenLogin(true);
  };

  const handleCloseLogin = () => {
    setOpenLogin(false);
  };

  const handleSwitchMsg = () => {
    dispatch(updateButtonMsg());
    swichLabel == "end" ? setSwichLabel("start") : setSwichLabel("end");
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
    <div>
      <Button color="inherit" variant="outlined" onClick={handleOpenLogin}>
        Login
      </Button>
      <Dialog open={openLogin} onClose={handleCloseLogin}>
        <DialogTitle>
          <FormControlLabel
            value={actionButtonMsg}
            control={<Switch color="primary" onChange={handleSwitchMsg} />}
            label={actionButtonMsg}
            labelPlacement={swichLabel}
          />
        </DialogTitle>
        <LoginForm setFormData={setFormData} />
        <DialogActions>
          <Button onClick={handleCloseLogin}>Cancel</Button>
          <Button type="submit" onClick={handleAction}>
            {actionButtonMsg}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Login;

// ---------------------------------------OLD CODE---------------------------------------------------------------
// import {
//   Card,
//   CardContent,
//   Typography,
//   Button,
//   TextField,
//   Switch,
// } from "@mui/material";

// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import LoginForm from "../LoginForm/LoginForm";
// import { updateButtonMsg } from "./loginSlice";
// // import "./login.css";
// import { GET_USER } from "../../mutations/Mutation";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import Cookies from "js-cookie";

// function Login({ setLoggedIn }) {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { buttonMsg, actionButtonMsg } = useSelector((state) => state.login);
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//     cnfPasswd: "",
//     firstName: "",
//     lastName: "",
//   });

//   useEffect(() => {
//     handleButtonMsg();
//     return () => {};
//   }, []);

//   const handleButtonMsg = () => {
//     dispatch(updateButtonMsg());
//   };

//   const handleAction = async (event) => {
//     event.preventDefault();
//     try {
//       const {
//         data: { data },
//       } = await axios({
//         method: "post",
//         url: process.env.REACT_APP_GRAPHQL_URL,
//         data: {
//           query: GET_USER,
//           variables: {
//             email: formData.email,
//             password: formData.password,
//             operation: actionButtonMsg,
//           },
//         },
//       });
//       if (data.users.email !== null && actionButtonMsg === "Login") {
//         // window.localStorage.setItem("users", JSON.stringify(data.users.token));
//         Cookies.set("jwt", JSON.stringify(data.users.token), {
//           expires: 0.0416667,
//         });
//         setLoggedIn(true);
//         return navigate("/home");
//       } else {
//         return navigate("/login");
//       }
//     } catch (error) {
//       console.error(error.message);
//     }
//   };

//   return (
//     <Card>
//       <CardContent>
//         <Typography variant="h5">
//           {actionButtonMsg ? "Login" : "Register"}
//         </Typography>
//         <form onSubmit={handleAction}>
//           <TextField
//             label="Email"
//             type="email"
//             fullWidth
//             margin="normal"
//             // value={email}
//             // onChange={(e) => setEmail(e.target.value)}
//           />
//           <TextField
//             label="Password"
//             type="password"
//             fullWidth
//             margin="normal"
//             // value={password}
//             // onChange={(e) => setPassword(e.target.value)}
//           />
//           {!actionButtonMsg && (
//             <TextField
//               label="Confirm Password"
//               type="password"
//               fullWidth
//               margin="normal"
//               // value={confirmPassword}
//               // onChange={(e) => setConfirmPassword(e.target.value)}
//             />
//           )}
//           <Button type="submit" variant="contained" color="primary" fullWidth>
//             {actionButtonMsg ? "Login" : "Register"}
//           </Button>
//         </form>
//         <div style={{ marginTop: "20px" }}>
//           <Typography variant="body2" color="textSecondary">
//             {actionButtonMsg
//               ? "Don't have an account?"
//               : "Already have an account?"}
//           </Typography>
//           <Switch
//             color="primary"
//             checked={actionButtonMsg}
//             onChange={() => setIsLogin(!actionButtonMsg)}
//           />
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// export default Login;
