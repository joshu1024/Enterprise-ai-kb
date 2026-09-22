# 🧠 Enterprise AI Knowledge Base

A production-ready multi-tenant RAG SaaS that lets teams upload company documents and query them in natural language. Built as part of a fullstack AI engineer learning roadmap.

![CI](https://github.com/joshu1024/Enterprise-ai-kb/actions/workflows/ci.yml/badge.svg)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6)
![Node](https://img.shields.io/badge/Backend-Node.js-green)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL+pgvector-336791)
![Cohere](https://img.shields.io/badge/Embeddings-Cohere-purple)
![Groq](https://img.shields.io/badge/LLM-Groq-orange)

---

## 🌐 Live Demo

- 🖥️ **Frontend (Vercel)** → https://enterprise-ai-kb.vercel.app
- ⚙️ **Backend (Render)** → https://enterprise-ai-kb.onrender.com

---

## 🤖 AI Features

### ✅ Completed

| Feature | Description | Tech |
|---------|-------------|------|
| Document ingestion | Upload PDF, DOCX, TXT, HTML — parsed, chunked, embedded, stored | pdf2json, mammoth, cheerio, Cohere |
| Recursive chunking | Splits on paragraphs → sentences → words. Preserves semantic boundaries | Custom implementation |
| Vector storage | 1024-dim Cohere embeddings stored in PostgreSQL with HNSW index | pgvector + Neon |
| HyDE retrieval | Generates hypothetical answer first, embeds that instead of raw query | Groq + Cohere |
| Hybrid search | Vector cosine similarity + BM25 keyword search fused with RRF | pgvector + PostgreSQL FTS |
| Re-ranking | LLM scores top 10 retrieved chunks, returns best 5 | Groq |
| Source citations | Every answer includes which document chunks it came from | Custom |
| Streaming answers | Word-by-word SSE streaming via raw fetch (bypasses SDK limitations) | Groq + SSE |
| Semantic caching | Near-identical queries (>0.92 similarity) served from cache — zero API cost | pgvector |
| Multi-tenant auth | Single org per email domain — company users share org automatically | bcryptjs + JWT |
| AI security layer | Rate limiting, prompt injection detection, per-user token quota | express-rate-limit |
| RAG evaluation | RAGAS-style faithfulness, relevance, context recall scoring | Groq as judge |
| Admin stats | Token usage, estimated cost, per-user breakdown | Prisma aggregation |
| Frontend UI | Chat with streaming citations, document library, admin panel, dark mode | React + TS + shadcn/ui |
| CI/CD pipeline | Automated tests + build check on every push | GitHub Actions |
| Unit tests | 51 tests — 19 backend + 32 frontend | Vitest |

---

## 🏗️ Architecture

User query
↓
HyDE — generate hypothetical answer → embed it
↓
Hybrid search — vector (pgvector) + keyword (BM25) → RRF fusion
↓
Re-ranking — LLM scores top 10 → returns best 5
↓
Context injection → streaming answer with [Source N] citations
↓
Semantic cache write (background)


### Why this pipeline beats basic RAG

| Basic RAG | This implementation |
|-----------|---------------------|
| Embed raw query | Embed hypothetical answer (HyDE) |
| Vector search only | Vector + keyword hybrid search |
| Return top-k directly | Re-rank with LLM cross-encoder |
| No caching | Semantic cache at 0.92 threshold |
| Generic retrieval | Org-scoped — users only access their own docs |

---

## 💡 Architectural Decisions

| Decision | Why |
|----------|-----|
| pgvector over Pinecone | Already on PostgreSQL — no new service, no extra cost. Handles current scale with HNSW indexing |
| Cohere over OpenAI for embeddings | Free tier (1000 calls/month), no credit card, 1024-dim vectors |
| Groq over OpenAI for LLM | Free tier, fast inference |
| Raw fetch over Groq SDK | SDK v1.5.0 couldn't parse reasoning model streaming chunks — raw SSE reading is more explicit and reliable |
| Recursive chunking | Preserves paragraph and sentence boundaries better than fixed-size. Splits on `\n\n` → `\n` → `. ` → ` ` |
| Background ingestion | Upload response is instant — chunking and embedding run async. User gets immediate feedback |
| Semantic caching | Repeated questions cost zero API calls. 0.92 similarity threshold balances cache hits vs answer freshness |
| Multi-tenant by domain | Users with same email domain auto-join same org. Public domains (gmail, yahoo) get personal orgs |

---

## 🗺️ RAG Pipeline Detail

**Step 1 — HyDE (Hypothetical Document Embeddings)**
Instead of embedding the raw user question, the LLM generates a fake answer first. That fake answer is embedded and used for retrieval. Questions and answers live in different vector spaces — embedding a fake answer gets you closer to the actual document chunks.

**Step 2 — Hybrid Search**
Two searches run in parallel:
- Vector search: cosine similarity via pgvector `<=>` operator
- Keyword search: PostgreSQL `to_tsvector` + `plainto_tsquery` (BM25-style)

Results are merged with Reciprocal Rank Fusion (RRF): `score = Σ 1/(k + rank)` where k=60.

**Step 3 — Re-ranking**
The top 10 hybrid results are scored by the LLM on relevance to the original query. This cross-encoder approach catches nuance that neither vector nor keyword search can.

**Step 4 — Context injection + streaming**
Top 5 re-ranked chunks are injected into the system prompt. The LLM is instructed to cite sources inline as `[Source N]`. Answer streams word by word via SSE.

**Step 5 — Semantic caching**
The full answer and citations are embedded and stored. Next time a similar question arrives (similarity > 0.92), the cache answer is returned immediately.

---

## 🧪 Tests

```bash
# Backend
cd server && npm run test:run

# Frontend  
cd client && npm run test:run
```

Backend — 19 passed (chunking, citations, injection detection, embedding parsing)
Frontend — 32 passed (auth slice, document slice, useChat, CitationCard)
Total — 51 passed


---

## 🧠 Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js + Express | REST API + SSE streaming |
| TypeScript | Full type safety throughout |
| PostgreSQL + pgvector | Relational data + vector similarity search |
| Prisma ORM | Schema, migrations, typed queries |
| Neon | Serverless PostgreSQL — never suspends |
| Cohere SDK | Text embeddings — embed-english-v3.0 |
| Groq API | LLM inference — fast free tier |
| Multer + pdf2json + mammoth | File upload and document parsing |
| express-rate-limit | Rate limiting on AI endpoints |
| bcryptjs + JWT | Auth and password hashing |
| Vitest | Unit testing |

### Frontend
| Technology | Purpose |
|------------|---------|
| React + TypeScript | UI framework |
| Redux Toolkit | Global state management |
| Tailwind CSS + shadcn/ui | Styling and components |
| Dark mode | System preference + manual toggle |
| Vercel | Deployment |

### DevOps
| Technology | Purpose |
|------------|---------|
| GitHub Actions | CI — runs 51 tests + build check on every push |
| Render | Backend deployment |
| Vercel | Frontend deployment |
| Neon | Serverless PostgreSQL |

---

## 🔐 Security

| Layer | Implementation |
|-------|----------------|
| Rate limiting | 20 requests per 15 minutes per IP on all AI endpoints |
| Token quota | 50,000 tokens per user per month — resets automatically |
| Input validation | Length limits + prompt injection pattern detection |
| Org scoping | Every DB query filtered by organizationId — no cross-tenant data access |
| JWT auth | All endpoints protected — role-based admin/member access |
| API key security | Keys in .env only — never in client code |
| Domain-based tenancy | Company email domains auto-grouped — public domains isolated |

---

## 🗄️ Database Schema

Organization ──< User
Organization ──< Document ──< DocumentChunk (vector embeddings)
Organization ──< SemanticCache (cached Q&A embeddings)


- **Organization** — top-level tenant, domain-based auto-grouping
- **User** — belongs to org, role admin/member, tracks aiTokensUsed
- **Document** — uploaded file, status (processing/ready/failed), chunkCount
- **DocumentChunk** — parsed text chunk + 1024-dim vector embedding
- **SemanticCache** — cached query + answer + citations + embedding

---

## ⚙️ Installation & Setup

### 1. Clone
```bash
git clone https://github.com/joshu1024/enterprise-ai-kb.git
cd enterprise-ai-kb
```

### 2. Backend setup
```bash
cd server
npm install
```

### 3. Configure environment variables

Create `server/.env`:
```env
PORT=4000
NODE_ENV=development
DATABASE_URL=your_neon_postgres_url
JWT_SECRET=your_jwt_secret_min_32_chars
ALLOWED_ORIGINS=http://localhost:5173
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=openai/gpt-oss-20b
COHERE_API_KEY=your_cohere_api_key
```

### 4. Enable pgvector
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 5. Push schema
```bash
npx prisma db push
npx prisma generate
```

### 6. Create HNSW index
```sql
CREATE INDEX IF NOT EXISTS chunk_embedding_hnsw_idx
ON "DocumentChunk"
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
```

### 7. Start backend
```bash
npm run dev
```

### 8. Frontend setup
```bash
cd ../client
npm install --legacy-peer-deps
```

Create `client/.env`:
```env
VITE_API_BASE_URL=http://localhost:4000
```

### 9. Start frontend
```bash
npm run dev
```

App runs on **http://localhost:5173**

---

## 🔌 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Create account + organization | Public |
| POST | `/api/auth/login` | Login | Public |
| GET | `/api/auth/me` | Get current user | Protected |
| POST | `/api/documents/upload` | Upload and ingest document | Admin |
| GET | `/api/documents` | List org documents | Protected |
| GET | `/api/documents/:id/status` | Check processing status | Protected |
| DELETE | `/api/documents/:id` | Delete document | Admin |
| POST | `/api/rag/query` | Query documents — SSE streaming | Protected |
| GET | `/api/rag/stats` | Token usage and cost stats | Admin |
| POST | `/api/rag/eval` | RAGAS-style eval on a response | Admin |

---

## ☁️ Deployment

### Backend on Render
1. New Web Service → connect GitHub repo
2. Root Directory: `server`
3. Build Command: `npm install && npx prisma generate && npm run build`
4. Start Command: `node dist/src/server.js`
5. Add all environment variables

### Frontend on Vercel
1. Import GitHub repo → Root Directory: `client`
2. Install Command: `npm install --legacy-peer-deps`
3. Add `VITE_API_BASE_URL` environment variable

---

## 🧑‍💻 Author

**Joshua Kipamet Olting'idi**

- 💼 [LinkedIn](https://www.linkedin.com/in/joshua-kipamet-148698140/)
- 💻 [GitHub @joshu1024](https://github.com/joshu1024)

---

## ⭐ Acknowledgements

- Cohere — free embeddings API
- Groq — free LLM inference
- Neon — serverless PostgreSQL
- Prisma — TypeScript ORM
- pgvector — vector similarity in PostgreSQL
- shadcn/ui — component library

---

💡 If you found this useful, please give it a ⭐ on GitHub!
