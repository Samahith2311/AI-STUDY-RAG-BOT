# Study Buddy — AI RAG Chatbot

**Live:** https://ai-study-rag-bot.vercel.app

Chat with your own study materials. Upload PDFs, notes, or text files; get accurate, cited answers streamed back in real time. Installable as a PWA.

## Stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** — sage/lime design system, Poppins font
- **Vercel AI SDK** (`ai` v3, `@ai-sdk/google`) — streaming chat
- **Google Gemini** — `gemini-1.5-flash` (chat) + `text-embedding-004` (embeddings, 768-dim)
- **Supabase** — Postgres + pgvector hybrid search, Auth (email + Google OAuth), RLS
- **next-pwa** — service worker, installable, offline app shell

## Setup

### 1. Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. Enable the `pgvector` extension: **Database → Extensions → vector**.
3. Run the migration: paste `supabase/migrations/001_init.sql` into the **SQL Editor** and execute it.
4. (Optional) Google OAuth: **Authentication → Providers → Google** — add your OAuth client credentials and set the redirect URL to `https://<your-domain>/auth/callback`.

### 2. Gemini API key

Get a free key from [Google AI Studio](https://aistudio.google.com/app/apikey).

### 3. Environment variables

Copy `.env.example` to `.env.local` and fill in the values:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-api-key
```

### 4. Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import at [vercel.com](https://vercel.com) — auto-detects Next.js.
3. Add the three env vars under **Project → Settings → Environment Variables**.
4. Deploy.

## PWA icons

Add `public/icons/icon-192.png` and `public/icons/icon-512.png` (192×192 and 512×512 PNGs). Generate them at [realfavicongenerator.net](https://realfavicongenerator.net).

## Architecture

```
Browser (PWA)
  → Next.js API routes (Node.js serverless)
      → Supabase: pgvector hybrid retrieval + Auth + documents table
      → Gemini REST: text-embedding-004 + gemini-1.5-flash (streamed)
```

**Ingest** (`POST /api/upload`):
1. Extract text — PDF via `pdf-parse`, plain text natively
2. Chunk with 500-char target, 100-char overlap; headings stay with their paragraph
3. Embed each chunk via `text-embedding-004` REST with exponential backoff on 429
4. Store chunks + 768-dim vectors in Supabase

**Chat** (`POST /api/chat`):
1. Embed the question
2. Call `match_chunks` (Postgres function): 70% vector cosine + 30% BM25, filtered by `user_id` via RLS
3. Build a grounded system prompt; instruct model to cite sources and say "I couldn't find that" when context is absent
4. Stream `gemini-1.5-flash` via Vercel AI SDK `streamText`

**Deep Think** toggle doubles retrieved chunks (12 vs 6) and asks for step-by-step reasoning.

## Rate limits

Free Gemini tier is rate-limited. Embedding uses exponential backoff (1.5 s → 3 s → 6 s → 12 s). Rate-limit errors surface a clear user message instead of crashing.
