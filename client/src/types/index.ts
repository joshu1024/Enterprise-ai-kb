export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member";
  organizationId: string;
  organizationName: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface Document {
  id: string;
  title: string;
  fileType: string;
  status: "processing" | "ready" | "failed";
  chunkCount: number;
  uploadedById: string;
  createdAt: string;
}

export interface DocumentState {
  documents: Document[];
  loading: boolean;
  uploading: boolean;
  error: string | null;
}

export interface Citation {
  index: number;
  documentId: string;
  documentTitle: string;
  excerpt: string;
  similarity: number;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  fromCache?: boolean;
}

export interface ChatState {
  messages: Message[];
  isStreaming: boolean;
  error: string | null;
}

export interface AdminStats {
  documentCount: number;
  chunkCount: number;
  cacheCount: number;
  totalTokensUsed: number;
  estimatedCostUsd: string;
  users: {
    id: string;
    name: string;
    email: string;
    aiTokensUsed: number;
    role: string;
  }[];
}
export interface ErrorResponse{
  message:string
}