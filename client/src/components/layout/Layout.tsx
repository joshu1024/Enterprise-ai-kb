import { useAppDispatch, useAppSelector } from "@/hooks";
import { logout } from "@/store/slices/authSlice";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {MessageSquare,FileText,LayoutDashboard, LogOut} from "lucide-react"
import { Separator } from "../ui/separator";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { useTheme } from "../../hooks/useTheme";
import { Sun, Moon } from "lucide-react";

export default function Layout(){
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const {user} = useAppSelector((s)=>s.auth);
    const { theme, setTheme } = useTheme();
    function handleLogout(){
        dispatch(logout());
        navigate("/login")
    }
    const navItems = [
        {to:"/chat",icon:MessageSquare,label:"Chat"},
        {to:"/documents",icon:FileText,label:"Documents"},
        ...(user?.role === "admin" ? [{to:"/admin",icon:LayoutDashboard,label:"Admin"}] : [])
    ]

    return(
        <div className="flex h-screen bg-background">
            <aside className="w-56 border-r flex flex-col justify-between">
                <div>
             <div className="p-4">
                <h1 className="text-sm font-semibold">Enterprise KB</h1>
                <p className="mt-0.5 text-muted-foreground text-xs">{user?.organizationName}</p>
            </div>
            <Separator/>
            <nav className="">
                {
                    navItems.map(({to,icon:Icon,label})=>(
                        <NavLink key={to} to={to} className={({isActive})=>
                           `flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                            isActive ? "bg-accent text-accent-foreground font-medium":"text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                           }                           
                           `
                        }>
                            <Icon size={15}/>
                            {label}
                        </NavLink>
                    ))
                }
            </nav>
            <Separator/>

            <div className="p-3 flex items-center gap-2">
                <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-xs">
                    {
                        user?.name?.charAt(0).toUpperCase()
                    }
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <p className="text-xs font-medium truncate">{user?.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                </div>
                <Button onClick={handleLogout} variant="ghost" size="icon" title="Logout" className="w-7 h-7">
                    <LogOut size={14}/>
                </Button>
            </div>
            </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 mb-2 hover:animate-pulse rounded-full"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        title="Toggle theme "
                        >
                        {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
                        </Button>
            </aside>
            <main className="flex-1 overflow-hidden">
                <Outlet/>
            </main>
        </div>
    )
}
