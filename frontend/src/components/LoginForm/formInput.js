import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    email: "admin@gmail.com",
    passwd: "admin@123",
    confirmPasswd: "admin@123"
}

export const FormInputSlice = createSlice({
    name: "registerForm",
    initialState,
    reducers: {
        addRegister: (state = initialState, action) => {
            switch (action.type) {
                default:
                    console.log(state, action.type)
                    return state
            }
        }
    }
})

export const { addRegister } = FormInputSlice.actions;

// export const loginFormReducer = LoginInput.reducer;
export const formInputReducer = FormInputSlice.reducer;