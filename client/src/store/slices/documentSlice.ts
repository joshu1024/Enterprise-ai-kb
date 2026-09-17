import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/index"
import type { AxiosError } from "axios";
import type { ErrorResponse } from "../../types/index";
import type {DocumentState} from "../../types/index"



export const fetchDocuments = createAsyncThunk(
    "documents/fetchAll",
    async(_,{rejectWithValue})=>{
        try {
            const res = await api.get("/api/documents");
            return res.data;
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>;
            rejectWithValue(error.response?.data?.message || "Failed to fetch documents.")
        }
    }
);

export const uploadDocument= createAsyncThunk(
    "documents/upload",
    async(data:{file:File,title:string},{rejectWithValue,dispatch})=>{
        try {
        const formData = new FormData();
        formData.append("file",data.file);
        formData.append("tite",data.title);

        await api.post("/api/documents/upload",formData,{
            headers:{"Content-Type":"multipart/form-data"}
        });
        dispatch(fetchDocuments());
        return true;
        } catch (err) {
            const error  = err as AxiosError<ErrorResponse>;
            rejectWithValue(error.response?.data?.message || "Upload failed.")
        }

    }
);

export const deleteDocument = createAsyncThunk(
    "documents/delete",
    async(id:string,{rejectWithValue,dispatch})=>{
        try {
            await api.delete(`/api/documents/${id}`);
            dispatch(fetchDocuments());
            return id;
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>;
            rejectWithValue(error.response?.data?.message || "Failed to delete document.")
        }
    }
)
const initialState:DocumentState = {
    documents:[],
    loading:false,
    uploading:false,
    error:null
}
const documentSlice = createSlice({
    name:"documents",
    initialState,
    reducers:{
        clearError:(state)=>{
            state.error = null
        }
    },
    extraReducers:(builder)=>{
        builder.addCase(fetchDocuments.pending,(state)=>{
            state.loading = false;
            state.error = null;
        }).addCase(fetchDocuments.fulfilled,(state,action)=>{
            state.loading = false;
            state.documents = action.payload
            state.error = null;
        }).addCase(fetchDocuments.rejected,(state,action)=>{
            state.loading = false;
            state.error = action.payload as string;
        }).addCase(uploadDocument.pending,(state)=>{
            state.uploading = false;
            state.error = null;
        }).addCase(uploadDocument.fulfilled,(state)=>{
            state.uploading = false;
            state.error = null;
        }).addCase(uploadDocument.rejected,(state,action)=>{
            state.uploading = false;
            state.error = action.payload as string;
        }).addCase(deleteDocument.pending,(state)=>{
            state.loading = false;
            state.error = null;
        }).addCase(deleteDocument.fulfilled,(state,action)=>{
            state.loading = false;
            state.documents = state.documents.filter((doc)=>doc.id !== action.payload)
            state.error = null;
        }).addCase(deleteDocument.rejected,(state,action)=>{
            state.uploading = false;
            state.error = action.payload as string;
        })
    }
});

export const {clearError} = documentSlice.actions;
export default documentSlice.reducer