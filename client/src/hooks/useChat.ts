import type { Message } from "../types"
import { useCallback, useRef, useState } from "react"


export const useChat =()=>{
    const[messages,setMessages] = useState<Message[]>([]);
    const[isStreaming,setIsStreaming] = useState(false);
    const abortRef = useRef<AbortController | null>(null);
    const [error,setError] = useState<string | null>(null);

    const sendMessage = useCallback( async(query:string)=>{
        if(!query.trim() || isStreaming) return;
        setError(null);
        const userMessage:Message = {role:"user",content:query};
        const assistantMessage:Message ={role:"assistant",content:"",citations:[]};
        setMessages((prev)=>[...prev,userMessage,assistantMessage]);
        setIsStreaming(true);
        abortRef.current = new AbortController();
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/api/rag/query`,
                {
                    method: "POST",
                    headers: {
                    "Content-Type": "application/json",
                    ...(token && { Authorization: `Bearer ${token}` }),
                    },
                    body: JSON.stringify({
                    query,
                    messages: messages
                        .filter((m) => m.content)
                        .map((m) => ({ role: m.role, content: m.content })),
                    }),
                    signal: abortRef.current.signal,
                }
                );
            if(!response){
                throw new Error("Query failed")
            }
            const reader = response.body!.getReader(); 
            const decoder = new TextDecoder();

            while(true){
                const{done,value} = await reader.read();
                if(done) break;
               const chunks = decoder.decode(value,{stream:true});
               const lines = chunks.split("\n");
               
               for(const line of lines){
                const trimmed = line.trim();
                if(!trimmed || trimmed === "date:[DONE]") continue;
                if(!trimmed.startsWith("data:")) continue;
                 try {
                    const parsed = JSON.parse(trimmed.slice(5));
                    if(parsed.citations){
                        setMessages(
                            (prev)=>{
                                const updated = [...prev];
                                updated[updated.length - 1] = {
                                    ...updated[updated.length - 1],
                                    citations:parsed.citations,
                                    fromCache:parsed.fromCache
                                }
                                return updated
                            }
                        )
                    }
                    if(parsed.token){
                        setMessages((prev)=>{
                            const updated = [...prev];
                            updated[updated.length - 1] = {
                                ...updated[updated.length - 1],
                                content:updated[updated.length - 1].content + parsed.token 
                            }
                            return updated
                        })
                    }
                    if(parsed.error){
                        throw new Error(parsed.error)
                    }
                 } catch {
                    //skip
                 }
               }
            }

        } catch (err:unknown) {
            if(err instanceof Error && err.name !== "AbortError"){
                setError(err.message)
            }
            setMessages((prev)=>prev.filter((_,i)=> i !== prev.length - 1 ))
        } finally{
            setIsStreaming(false);
            abortRef.current = null;
        }
    },[messages,isStreaming]);
    const stopStream = useCallback(
        ()=>{
            abortRef.current?.abort();
            setIsStreaming(false)
        }
        ,[]);
        const clearChat = useCallback(() => {
    if (!isStreaming) setMessages([]);
  }, [isStreaming]);
  return { messages, isStreaming, error, sendMessage, stopStream, clearChat };
}