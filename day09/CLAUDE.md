# CLAUDE.md — ShopWave AI

> This file is auto-loaded by Claude Code as project context. Keep it accurate; it is the single source of truth Claude reads before every task.

## Project

ShopWave AI is a MERN e-commerce store with deep AI integration via the Anthropic API. Built live in a 3-hour AcademyDSJ class to demonstrate production AI feature patterns.

## Stack & Versions

- **Database:** MongoDB (local), Mongoose ODM
- **Backend:** Node.js (v18+), Express, ES modules (`"type": "module"`)
- **Frontend:** React 18 + Vite, React Router, Tailwind CSS
- **AI:** `@anthropic-ai/sdk`, model `claude-sonnet-4-6`
- **State:** React Context for cart; fetch for API calls

## Directory Layout

```
shopwave-ai/
├── server/
│   ├── index.js              # Express entry
│   ├── config/db.js          # Mongo connection
│   ├── models/Product.js
│   ├── models/Order.js
│   ├── routes/products.routes.js
│   ├── routes/ai.routes.js   # ALL ai endpoints live here
│   ├── services/ai.service.js # SHARED Anthropic client — reuse everywhere
│   ├── seed/seed.js
│   └── .env                  # ANTHROPIC_API_KEY, MONGO_URI, PORT
└── client/
    ├── src/main.jsx
    ├── src/App.jsx
    ├── src/context/CartContext.jsx
    ├── src/components/        # ProductCard, AISearchBar, ChatWidget, RecRail
    ├── src/pages/             # Home, ProductPage, Admin
    └── src/lib/api.js         # fetch wrapper, base URL
```

## Hard Rules (non-negotiable)

1. **One AI service.** All Anthropic calls go through `server/services/ai.service.js`. Routes never `import Anthropic` directly. This is the core teaching pattern.
2. **Model string is `claude-sonnet-4-6`.** Never hardcode dated snapshots or older aliases elsewhere.
3. **Never prefill assistant messages** — Sonnet 4.6 returns 400. Use system-prompt instructions or structured output for JSON.
4. **Ground every AI response in real catalog data.** Pass product context into the messages; do not let Claude invent products or prices.
5. **API key only in `server/.env`.** Never in client code, never committed. Client talks to our backend, never to Anthropic directly.
6. **ES modules everywhere** (`import`/`export`), both client and server.
7. **Tailwind for all styling.** No inline style objects except dynamic values. Aim for clean, modern, generous spacing.
8. **Errors are handled.** Every AI call wrapped in try/catch; return a friendly fallback, never a 500 with a stack trace to the client.

## AI Feature Map (all via ai.service.js)

| Feature | Endpoint | Service method | Technique |
|---|---|---|---|
| Semantic search | `POST /api/ai/search` | `semanticSearch()` | tool use / JSON ranking |
| Chat assistant | `POST /api/ai/chat` | `chat()` | streaming + tool use |
| Content gen | `POST /api/ai/generate-content` | `generateProductContent()` | structured JSON output |
| Recommendations | `POST /api/ai/recommend` | `recommend()` | reasoning over context |

## Conventions

- API responses: `{ success: boolean, data?, error? }`.
- Async/await only, no `.then()` chains.
- Component files PascalCase; util files camelCase.
- Keep functions small; comment the *why*, not the *what*.

## When generating code

- Match the layout above exactly.
- Reuse `ai.service.js`; do not duplicate the Anthropic client.
- Prefer clarity over cleverness — this code is read live to students.
