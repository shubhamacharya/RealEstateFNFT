import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  buttonMsg: "",
  actionButtonMsg: "",
};

export const loginSlice = createSlice({
  name: "login",
  initialState,
  reducers: {
    updateButtonMsg: (state) => {
      state.buttonMsg = state.buttonMsg === "Register" ? "Login" : "Register";
      state.actionButtonMsg = state.buttonMsg === "Register" ? "Login" : "Register";
    },
  },
});

export const { updateButtonMsg } = loginSlice.actions;
export const loginReducer = loginSlice.reducer;
