import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom"
import { LoginPage } from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import { useAppDispatch, useAppSelector } from "./hooks"
import Layout  from "./components/layout/Layout"
import ChatPage from "./pages/ChatPage"
import DocumentsPage from "./pages/DocumentsPage"
import type React from "react"
import AdminPage from "./pages/AdminPage"
import { useEffect } from "react"
import { getMe } from "./store/slices/authSlice"

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAppSelector((s) => s.auth);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AdminRoute =({children}:{children:React.ReactNode})=>{
  const {user,isAuthenticated} = useAppSelector((s)=>s.auth);
  if(!isAuthenticated) return <Navigate to="/login"/>
  if(user?.role !== "admin") return <Navigate to="/chat"/>
  return <>{children}</>
}
export default function App() {
  const dispatch = useAppDispatch();
  const {token} = useAppSelector((s)=>s.auth);
  
  useEffect(()=>{
    if(token) dispatch(getMe())
  },[token,dispatch])
  return (
    
    <BrowserRouter>
    <Routes>
      <Route path="/login" element={<LoginPage/>}/>
      <Route path="/register" element={<RegisterPage/>}/>
      <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
        <Route index element={<Navigate to="/chat"/>}/>
        <Route path="chat" element={<ChatPage/>}/>
        <Route path="documents" element={<DocumentsPage/>}/>
        <Route path="admin" element={
          <AdminRoute>
            <AdminPage/>
          </AdminRoute>
        }/>
        </Route>
    </Routes>
    </BrowserRouter>
    
  )
}


