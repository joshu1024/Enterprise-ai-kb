import api from "@/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminStats } from "@/types"
import { Database, DollarSign, FileText, Users, Zap } from "lucide-react";
import { useEffect, useState } from "react"

export default function AdminPage(){
    const[stats,setStats] = useState<AdminStats | null>(null);
    const[loading,setLoading] = useState(false);
    useEffect(()=>{
        api.get("/api/rag/stats")
        .then((res)=>{
            console.log("Stats response:", res.data);
            setStats(res.data)})
        .finally(()=>setLoading(false))
    },[]);

    if(loading){
        return(
            <div className="flex items-center justify-center h-full">
                <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
        )
    }
    if(!stats) return null;
    const metricCards = [
    {
      label: "Documents",
      value: stats.documentCount,
      icon: FileText,
    },
    {
      label: "Chunks indexed",
      value: stats.chunkCount.toLocaleString(),
      icon: Database,
    },
    {
      label: "Cached answers",
      value: stats.cacheCount,
      icon: Zap,
    },
    {
      label: "Tokens used",
      value: stats.totalTokensUsed.toLocaleString(),
      icon: Users,
    },
    {
      label: "Estimated cost",
      value: `$${stats.estimatedCostUsd}`,
      icon: DollarSign,
    },
  ];
    return(
         <div className="h-full overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto space-y-6">
                <div>
                    <h2 className="text-sm font-medium">Admin DashBoard</h2>
                    <p className="text-xs text-muted-foreground"> AI usage and knowledge base stats</p>
                </div>


                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {
                        metricCards.map(({label,value,icon:Icon})=>(
                            <Card key={label}>
                                <CardContent className="pt-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Icon size={13} className="text-muted-foreground"/>
                                            <p className="text-xs text-muted-foreground">
                                                {label}
                                            </p>
                                        </div>
                                        <p className="text-xl font-medium">{value}</p>
                                   
                                </CardContent>
                            </Card>
                        ))
                    }
                </div>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">
                        Per-user token usage
                        </CardTitle>
                    </CardHeader>
                     <CardContent>
            {stats.users.length === 0 ? (
              <p className="text-sm text-muted-foreground">No usage yet.</p>
            ) : (
              <div className="space-y-2">
                {stats.users.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium">{u.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {u.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        {u.aiTokensUsed.toLocaleString()} tokens
                      </span>

                    <span className="text-xs">{u.role}</span>
                      
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
                </Card>
            </div>
        </div>
    )
}