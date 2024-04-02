import { configureStore } from "@reduxjs/toolkit";
import { loginReducer } from "../components/Login/loginSlice";
import { formInputReducer } from "../components/LoginForm/formInput";

const store = configureStore({
  reducer: {
    login: loginReducer,
    registerForm: formInputReducer,
  },
});

export default store;
