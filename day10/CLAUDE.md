# DocChat AI — Project Context

A MERN + AI app built **live with Claude Code** in a 2-hour class for AcademyDSJ
(MERN + AI Live Batch 2026, **Session 8 — AI Integration Part 2**).

DocChat AI lets a user **paste/upload a document** and then **chat with it** — a
streaming AI assistant that answers questions using only that document (RAG),
remembers the conversation, can summarise the doc, and is guarded against abuse.

This one app deliberately exercises all 6 topics from Session 8:

| Session 8 topic            | Where it shows up in DocChat AI                          |
|----------------------------|----------------------------------------------------------|
| 1. Chatbot UI + streaming  | `ChatWidget` + SSE streaming reply, optimistic messages  |
| 2. Multi-turn / context    | Conversation stored per session; auto-summarise on growth|
| 3. Document analysis (RAG) | Upload → chunk → store; retrieve top-K chunks per query   |
| 4. Content generation      | One-click "Summarise this document" (structured output)  |
| 5. Tool use                | Assistant has a `search_document` tool (agentic loop)    |
| 6. Safety & guardrails     | Injection regex + rate limit + safe fallback + input wrap|

## Stack & conventions

- **Backend:** Node 18+, Express, ES modules, MongoDB (local `mongod`).
- **Frontend:** Vite + React 18 + Tailwind. No component library — hand-rolled, clean UI.
- **AI provider:** Anthropic Claude. Model: **`claude-sonnet-4-6`** everywhere.
  `ANTHROPIC_API_KEY` lives in `server/.env`. Never import the Anthropic SDK
  outside `server/services/ai.service.js`.
- **Response shape:** `{ success, data }` on success, `{ success: false, error }` on failure.
- **No real embeddings API in the live build** — retrieval uses a simple lexical
  (keyword-overlap) scorer in `ai.service.js` so the class needs only ONE API key.
  The slides teach embeddings + cosine similarity as the production upgrade;
  keep a `// PROD: swap for text-embedding-3-small + cosine` comment where relevant.

## Target structure

```
docchat-ai/
├── CLAUDE.md
├── server/
│   ├── index.js                  # express app, cors, json, mount routes
│   ├── config/db.js              # mongoose connect
│   ├── models/Document.js        # { title, fullText, chunks:[{index,text}], createdAt }
│   ├── models/Conversation.js    # { docId, messages:[{role,content}], summary, createdAt }
│   ├── services/ai.service.js    # ONLY file importing @anthropic-ai/sdk
│   ├── middleware/safety.js      # rate limiter + injection guard
│   ├── routes/docs.routes.js     # POST /api/docs (ingest), GET /api/docs/:id
│   └── routes/ai.routes.js       # POST /api/ai/chat (SSE), /api/ai/summarise
└── client/
    ├── src/lib/api.js
    ├── src/hooks/useChat.js       # streaming + optimistic state
    ├── src/components/UploadPanel.jsx
    ├── src/components/ChatWidget.jsx
    └── src/App.jsx
```

## ai.service.js — the contract

Export one initialized Anthropic client (model `claude-sonnet-4-6`) and these methods:

- `chunkText(text)` → `[{ index, text }]`  (≈400-word chunks, 40-word overlap)
- `searchChunks(chunks, query, topK=4)` → ranked chunks (lexical overlap score)
- `streamChat({ res, docId, messages })` → SSE stream with a `search_document`
  tool; runs the tool-use loop, then streams the final answer token-by-token.
- `summariseDocument(fullText)` → `{ summary, keyPoints[] }` (structured, parsed safely)
- `summariseConversation(messages)` → short string (used when history gets long)

## Safety rules (always on)

- Per-user/IP rate limit on `/api/ai/*` (20 req/min).
- Regex injection check on every user message **before** calling Claude.
- Wrap untrusted document text and user input so the model won't follow embedded
  instructions.
- On any LLM error, return a friendly fallback string — never leak the error,
  the prompt, or the API key to the client.
