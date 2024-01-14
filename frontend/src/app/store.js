import { configureStore } from "@reduxjs/toolkit";
import { loginReducer } from "../components/Login/loginSlice";

const store = configureStore({
  reducer: {
    login: loginReducer,
  },
});

export default store;
