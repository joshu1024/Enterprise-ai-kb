
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { useEffect, useState } from "react";
import { clearError, login } from "@/store/slices/authSlice";



export const LoginPage =()=>{
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const {loading,error,isAuthenticated} = useAppSelector((state)=>state.auth);
    const[form,setForm] = useState({
        email:"",
        password:""
    });
    useEffect(() => {
    if (isAuthenticated) navigate("/chat");
    return () => { dispatch(clearError()); };
  }, [isAuthenticated,dispatch,navigate]);

  function handleSubmit(e: React.SubmitEvent){
    e.preventDefault();
    dispatch(login(form))
  }
    return(
        <div className="min-h-screen flex items-center justify-center bg-background p-4 ">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-xl">Sign in</CardTitle>
                    <CardDescription>Access your organization's knowledge base</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="email">Email</Label>
                            <Input value={form.email} 
                                   placeholder="you@company.com" 
                                   required type="email"
                                   onChange={(e)=>setForm({...form,email:e.target.value})}
                                   />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="password">Password</Label>
                            <Input 
                                value={form.password} 
                                required type="password"
                                placeholder="••••••••"
                                onChange={(e)=>setForm({...form,password:e.target.value})}
                                />
                        </div>
                        {
                            error && <p className="text-sm text-destructive">{error}</p>
                        }
                        <Button disabled={loading} className="w-full">{loading ? "Signing in..." :"Sign in"}</Button>
                        <p className="text-sm text-center text-muted-foreground">
                            No account? {" "}
                            <Link to="/register" className="underline text-foreground">
                            Register your organization
                            </Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
             
        </div>
    )
}
