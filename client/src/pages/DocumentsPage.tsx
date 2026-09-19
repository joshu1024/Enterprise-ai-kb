import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useAppDispatch, useAppSelector } from "@/hooks"
import { deleteDocument, fetchDocuments,uploadDocument } from "@/store/slices/documentSlice";
import {  FileText, RefreshCw, Trash2, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";


export default function DocumentsPage(){
  const {user} = useAppSelector((s)=>s.auth);
  const{documents,loading,uploading} = useAppSelector((s)=>s.document)
  const dispatch = useAppDispatch();
  const isAdmin = user?.role === "admin";
  const fileRef = useRef<HTMLInputElement>(null);
  const [title,setTitle] = useState("");
  const [selectedFile,setSelectedFile] = useState<File | null>(null);

  useEffect(()=>{
    dispatch(fetchDocuments());
  },[dispatch]);

  useEffect(()=>{
    const hasProcessing = documents.some((d)=>d.status === "processing");
    if(!hasProcessing) return;
    const interval = setInterval(()=>dispatch(fetchDocuments()),3000);
    return ()=> clearInterval(interval);
  },[documents,dispatch]);

    function handleUpload(){
      if(!selectedFile) return;
      dispatch(uploadDocument({file:selectedFile,title: title || selectedFile.name}));
      setSelectedFile(null);
      setTitle("");
      if(fileRef.current) fileRef.current.value = "";
    }
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-3 border-b flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium">Documents</h2>
          <p className="text-xs text-muted-foreground">
            {documents.length} document{documents.length !== 1 ? "s" : ""} in
            your knowledge base
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => dispatch(fetchDocuments())}
          disabled={loading}
          className="text-muted-foreground"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Upload section — admin only */}
          {isAdmin && (
            <Card>
              <CardContent className="pt-4 space-y-3">
                <p className="text-sm font-medium">Upload document</p>
                <Input
                  placeholder="Document title (optional)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <div className="flex gap-2">
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf,.docx,.txt,.html"
                    className="flex-1 text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border file:text-xs file:font-medium file:bg-background file:cursor-pointer cursor-pointer"
                    onChange={(e) =>
                      setSelectedFile(e.target.files?.[0] || null)
                    }
                  />
                  <Button
                    onClick={handleUpload}
                    disabled={!selectedFile || uploading}
                    size="sm"
                  >
                    <Upload size={13} className="mr-1.5" />
                    {uploading ? "Uploading..." : "Upload"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Supported: PDF, DOCX, TXT, HTML · Max 10MB
                </p>
                {uploading && (
                  <Progress value={undefined} className="h-1 animate-pulse" />
                )}
              </CardContent>
            </Card>
          )}

          {/* Document list */}
          {loading && documents.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Loading documents...
            </p>
          ) : documents.length === 0 ? (
            <div className="text-center py-12">
              <FileText
                size={32}
                className="mx-auto text-muted-foreground mb-3"
              />
              <p className="text-sm text-muted-foreground">
                No documents yet.
                {isAdmin ? " Upload one to get started." : " Ask your admin to upload documents."}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <Card key={doc.id}>
                  <CardContent className="py-3 px-4 flex items-center gap-3">
                    <FileText
                      size={16}
                      className="text-muted-foreground shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {doc.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {doc.chunkCount > 0
                          ? `${doc.chunkCount} chunks`
                          : doc.fileType}{" "}
                        · {new Date(doc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      doc.status === "ready"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : doc.status === "processing"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    }`}
                  >
                    {doc.status === "processing" && (
                      <RefreshCw size={10} className="inline mr-1 animate-spin" />
                    )}
                    {doc.status}
                  </span>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => dispatch(deleteDocument(doc.id))}
                      >
                        <Trash2 size={13} />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


