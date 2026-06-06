# ShopWave AI — 3-Hour Live Build Runbook

**Project:** AI-powered MERN e-commerce store, built live with Claude Code
**Audience:** Intermediate (AcademyDSJ regulars)
**Stack:** MongoDB (local) + Express + React (Vite) + Node.js + Anthropic API
**Goal:** Show "world-best AI features" packed into one clean e-commerce app in 3 hours.

---

## The 4 AI Features We Build (max-AI theme)

1. **AI Semantic Product Search** — natural-language queries ("a warm jacket for rainy weather under 5000") matched against products using embeddings-style relevance ranking via Claude tool use.
2. **AI Shopping Assistant Chatbot** — streaming chat that knows the catalog, recommends products, and can add to cart via tool calls.
3. **AI Content Generation** — one-click product description + SEO tags + marketing copy generation in the admin panel.
4. **AI Personalized Recommendations** — "You might also like" powered by Claude reasoning over cart + browsing context.

All four hit the **same Anthropic backend service** (`/server/services/ai.service.js`) so students see one clean integration pattern reused four ways.

---

## Pre-Class Setup (do BEFORE going live — saves ~40 min)

> Tell students to do this the night before. On stream, you only *verify* it.

```bash
# 1. Tools
node -v          # need v18+
mongod --version # local MongoDB running

# 2. Claude Code
npm install -g @anthropic-ai/claude-code
claude --version

# 3. API key (Anthropic Console -> API Keys)
# Put in server/.env as ANTHROPIC_API_KEY=sk-ant-...

# 4. Start mongo
mongod --dbpath ~/data/db
```

Have `ANTHROPIC_API_KEY` ready. Seed data + UI shell are committed so you don't burn live time on boilerplate — Claude Code generates the AI layers live.

---

## Minute-by-Minute Timeline (180 min)

### Block 0 — Intro & Architecture (0:00 – 0:15)
- Show the finished app for 60 seconds (the hook).
- Open `CONTEXT_ENGINEERING.md` + `CLAUDE.md`, explain *why* good context = good Claude Code output. This is the teaching spine.
- Show the 4 AI features on the architecture diagram.

### Block 1 — Project Scaffold + Backend Core (0:15 – 0:45)
- Open Claude Code, paste **Prompt 1** (scaffold) from `PROMPTS_CHEATSHEET.md`.
- Verify Express server, Mongo connection, Product model, seed script.
- `npm run seed` → confirm products in DB.
- Run server, hit `/api/products` → JSON. ✅ checkpoint.

### Block 2 — The AI Service Layer (0:45 – 1:15)
- Paste **Prompt 2** → builds `ai.service.js` (the shared Anthropic client).
- Explain the messages API, system prompts, tool use, streaming.
- Build **Feature 1: AI Semantic Search** endpoint together.
- Test in browser/Postman: `POST /api/ai/search { "query": "warm jacket for rain under 5000" }`. ✅

### --- BREAK (1:15 – 1:25) ---

### Block 3 — Frontend Shell + Search UI (1:25 – 1:50)
- Paste **Prompt 3** → React shell (Vite), routing, product grid, the "supiri UI/UX" with Tailwind.
- Wire the AI search bar to Feature 1. Live demo: type a vibe, get ranked products. 🔥

### Block 4 — AI Chatbot Assistant (1:50 – 2:25)
- Paste **Prompt 4** → streaming chat endpoint + tool use (search catalog, add to cart).
- Build the floating chat widget. Demo: "I need a gift for my mom under 3000" → it recommends + adds to cart. 🔥🔥

### Block 5 — AI Content Gen + Recommendations (2:25 – 2:55)
- Paste **Prompt 5** → admin "Generate with AI" button (Feature 3).
- Paste **Prompt 6** → "You might also like" rail on product page (Feature 4).
- Quick demos of both.

### Block 6 — Wrap, Q&A, Next Steps (2:55 – 3:00)
- Recap the one reusable AI pattern → four features.
- Tease: deploy, add image gen, vector DB for scale.
- CTA: full repo + these files for AcademyDSJ students.

---

## Live-Demo Safety Net

- **If Claude Code stalls live:** the `client-snippets/` and `server-snippets/` folders contain the exact working code each prompt should produce. Paste the snippet, keep moving, explain it.
- **If API errors:** check `.env` key, check model string is `claude-sonnet-4-6`, check you're not double-billing rate limits.
- **If Mongo errors:** `mongod` not running or wrong `MONGO_URI`.
- Keep a finished build running on a second port (`5174`) as the "this is where we're headed" reference.

---

## What makes the AI feel "world-best" (talking points)

- **Tool use** lets Claude *act* (search, add to cart), not just chat.
- **Streaming** makes the chatbot feel instant.
- **Context engineering** — feeding Claude the live catalog as structured context = grounded, no-hallucination recommendations.
- **One service, many features** — the architecture lesson worth more than any single feature.
