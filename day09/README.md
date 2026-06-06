# ShopWave AI — Class Package

AI-powered MERN e-commerce store, built live in 3 hours with Claude Code.
This package gives you everything to **run the class**, not the finished repo —
Claude Code generates the app live from these prompts. The `*-snippets/` folders
are your safety net (paste if a live generation stalls).

## What's inside

```
shopwave-ai/
├── CLAUDE.md                       # project context (goes in repo root)
├── docs/
│   ├── WEBINAR_RUNBOOK.md          # minute-by-minute 3-hour plan
│   ├── PROMPTS_CHEATSHEET.md       # 6 copy-paste prompts, in order
│   └── CONTEXT_ENGINEERING.md      # the teaching spine
├── server-snippets/                # reference backend (safety net)
│   ├── ai.service.js               # shared Anthropic client — 4 features
│   ├── ai.routes.js                # incl. streaming chat + tool-use loop
│   ├── server-core.js              # index/db/models/routes combined
│   └── seed.js                     # 12 products, 4 categories
└── client-snippets/
    └── frontend-reference.jsx      # api, cart, search bar, card, chat widget
```

## How to use it

1. **Before class:** read `WEBINAR_RUNBOOK.md`. Do the Pre-Class Setup. Drop
   `CLAUDE.md` in your empty `shopwave-ai/` repo root.
2. **During class:** follow the runbook timeline. Paste prompts 1→6 from
   `PROMPTS_CHEATSHEET.md` into Claude Code. Demo after each.
3. **If something breaks:** open the matching file in `*-snippets/`, paste the
   working code, explain it, move on.

## The 4 AI features (all via one service)

1. Semantic product search — natural-language → ranked products
2. Streaming chatbot assistant — recommends + adds to cart via tool use
3. AI content generation — product description/SEO/marketing in admin
4. Personalized recommendations — "you might also like"

## Requirements

- Node v18+, local MongoDB running (`mongod`)
- `npm i -g @anthropic-ai/claude-code`
- `ANTHROPIC_API_KEY` in `server/.env`
- Model used throughout: `claude-sonnet-4-6`

## Server deps to install live
```bash
cd server && npm init -y
npm i express cors mongoose dotenv @anthropic-ai/sdk
npm i -D nodemon
# package.json: "type":"module", scripts: dev/seed
```

## Client deps
```bash
npm create vite@latest client -- --template react
cd client && npm i react-router-dom
# add Tailwind per tailwindcss.com/docs/guides/vite
```
