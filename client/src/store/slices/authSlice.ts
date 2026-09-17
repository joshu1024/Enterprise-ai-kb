import type { AuthState, ErrorResponse } from "@/types";
import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import api from "../../api/index"
import type { AxiosError } from "axios";



const initialState:AuthState = {
    user:null,
    token:localStorage.getItem("token"),
    isAuthenticated:!!localStorage.getItem("token"),
    loading:false,
    error:null
}

export const register = createAsyncThunk(
    "auth/register",
    async(data:{name:string,email:string,password:string,organizationName:string},{rejectWithValue})=>{
        try {
            const res = await api.post(`/api/auth/register`,data);
            localStorage.setItem("token",res.data.token);
            return res.data;
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>
            rejectWithValue(error.response?.data?.message || "Registration failed")
        }
    }
)
export const login = createAsyncThunk(
    "auth/login",
    async(data:{email:string,password:string},{rejectWithValue})=>{
        try {
            const res = await api.post("/api/auth/login",data);
        localStorage.setItem("token",res.data.token);
        return res.data;
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>;
            rejectWithValue(error.response?.data?.message || "Faied to log in")
        }
    }
);
export const getMe = createAsyncThunk(
    "auth/getMe",
    async(_,{rejectWithValue})=>{
        try {
            const res = await api.get("/api/auth/me");
            return res.data;
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>;
            rejectWithValue(error.response?.data?.message || "Failed to fetch user")
        }

    }
)

const authSlice = createSlice({
    name:"auth",
    initialState,
    reducers:{
        logout:(state)=>{
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            localStorage.removeItem("token");
        },
        clearError:(state)=>{
            state.error = null
        }
    },
    extraReducers:(builder)=>{
        builder.addCase(register.pending,(state)=>{
            state.loading = true;
            state.error = null;
        }).addCase(register.fulfilled,(state,action)=>{
            state.loading = false;
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
        }).addCase(register.rejected,(state,action)=>{
            state.loading = false;
            state.error = action.payload as string;
        }).addCase(login.pending,(state)=>{
            state.loading = true;
            state.error = null
        }).addCase(login.fulfilled,(state,action)=>{
            state.loading = false;
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
        }).addCase(login.rejected,(state,action)=>{
            state.loading = false;
            state.error = action.payload as string;
        }).addCase(getMe.pending,(state)=>{
            state.loading = true;
            state.error = null;
        }).addCase(getMe.fulfilled,(state,action)=>{
            state.loading = false;
            state.user = action.payload;
        }).addCase(getMe.rejected,(state)=>{
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            localStorage.removeItem("token")
        })
    } 
});

export const {logout,clearError} = authSlice.actions;
export default authSlice.reducer;