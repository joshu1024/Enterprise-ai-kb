import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../store/slices/authSlice"
import documentReducer from "../store/slices/documentSlice"

export const store = configureStore({
    reducer:{
        auth:authReducer,
        document:documentReducer
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch