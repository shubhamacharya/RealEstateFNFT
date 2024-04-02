import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    tokenName: "",
    tokenPrice: "",
    tokenFraction: "",
    tokenURL: "",
    tokenOwner: "",
};

export const mintTokenSlice = createSlice({
    name: "mintToken",
    initialState,
    reducers: {
        createToken: (state) => {
            state.buttonMsg = state.buttonMsg === "Register" ? "Login" : "Register";
            state.actionButtonMsg = state.buttonMsg === "Register" ? "Login" : "Register";
        },
    },
});

export const { createToken } = mintTokenSlice.actions;
export const loginReducer = mintTokenSlice.reducer;
