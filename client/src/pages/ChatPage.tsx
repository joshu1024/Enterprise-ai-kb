import CitationCard from "@/components/chat/CitationCard";
import { Button } from "@/components/ui/button";
import { useChat } from "@/hooks/useChat";
import { Send, Square, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const SUGGESTIONS = [
  "What does this document cover?",
  "Summarize the key points",
  "What are the main requirements?",
  "Explain the process described",
];
export default function ChatPage() {
    const { messages, isStreaming, error, sendMessage, stopStream, clearChat } = useChat();
    const[input,setInput] = useState("");
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(()=>{
        bottomRef.current?.scrollIntoView({behavior:"smooth"});
    },[messages]);

    function handleSend(){
        if(!input.trim() || isStreaming) return;
        sendMessage(input.trim());
        setInput("");
    }

    function handleKeyDown(e:React.KeyboardEvent){
        if(e.key === "Enter" && !e.shiftKey){
          e.preventDefault();
          handleSend();  
        }
    }
    return(
       <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-6 py-3 border-b">
            <div>
                <h2 className="text-sm font-medium">Knowledge base chat</h2>
                <p className="text-xs text-muted-foreground">Ask questions about your uploaded documents</p>
            </div>
            {
               messages.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearChat} disabled={isStreaming} className="text-muted-foreground">
                        <Trash2 size={14} className="mr-1.5"/>
                        Clear
                    </Button>
                )
            }
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">
            {
                messages.length === 0 &&(
                    <div className="flex flex-col items-center justify-center gap-4 h-full min-w-75">
                        <p className="text-sm text-muted-foreground">Ask anything about your documents</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {
                                SUGGESTIONS.map((s)=>(
                                    <Button key={s} onClick={()=>sendMessage(s)} className="text-xs border rounded-full px-3 py-1.5 hover:bg-accent transition-colors text-muted-foreground">{s}</Button>
                                ))
                            }
                        </div>
                    </div>
                )
            }
            <div className="">
                {
                    messages.map((msg,i)=>(
                        <div className="" key={i}>
                            <div className="">
                                <p className="">{msg.content}</p>
                                {
                                    msg.role ==="assistant" && (isStreaming && i === messages.length -1) && !msg.content &&(
                                        <span className="inline-block w-1.5 h-4 bg-foreground/50 animate-pulse"></span>
                                    )
                                }
                                {
                                    msg.role === "assistant" && msg.citations && msg.citations.length > 0 && (
                                        <CitationCard citations={msg.citations} fromCache={msg.fromCache}/>
                                    )
                                }
                            </div>
                        </div>
                    ))
                }
                {
                 error && (
                    <p className="text-sm text-destructive text-center">{error}</p>
                  )  
                }
                <div ref={bottomRef}></div>
            </div>
        </div>

        <div className="px-6 py-4 border-t">
            <div className="max-w-2xl mx-auto flex gap-2">
                <textarea onKeyDown={handleKeyDown} 
                          rows={1} value={input} 
                          onChange={(e)=>setInput(e.target.value)} 
                          placeholder="Ask about your documents..." disabled={isStreaming} onInput={(e)=>{
                             const t = e.target as HTMLTextAreaElement;
                             t.style.height = "auto";
                             t.style.height = t.scrollHeight + "px"
                            }}
                className="flex-1 resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 max-h-32 overflow-y-auto"/>
                {
                    isStreaming ? (<Button variant="destructive" size="icon" onClick={stopStream} title="stop"><Square size={14}/></Button>) :(
                    <Button size="icon" disabled={!input.trim()} onClick={handleSend}><Send size={14}/></Button>)
                }
            </div>
        </div>

       </div>
    )
}