# Day 08 — AI Integration Part 1 🧠✨

**Session 7 — AcademyDSJ MERN + AI Course**
Date: 2026-05-23 (Saturday)

Day 07 walin MERN stack complete kara — Mongo + Express + React + Node ekkak. Tasks API eka pure CRUD app ekak. Today **AI brain ekak** ekata add karanawa — Anthropic Claude API use kara "smart" features 4k danawa:

1. ✨ **AI categorize** — Title eka denakota Claude eka priority + tags suggest karanawa
2. ✨ **AI enhance** — Short title eka denakota detailed description ekak generate karanawa
3. ✨ **AI suggest subtasks** — Task ekak denakota 3-5 subtasks gen karanawa
4. ✨ **AI chat (streaming)** — Token-by-token streaming response demo

End of class: **MERN + AI** = real end-to-end project oyage hands eke 🚀

---

## 📁 Folder Structure

```
day08/
├── README.md                          ← මේ file එක
├── examples/                          ← Concept-by-concept SDK walkthrough
│   ├── 01-first-claude-call.js        ← Hello Claude (simplest possible call)
│   ├── 02-system-and-user-prompts.js  ← System prompt = persona, user = ask
│   ├── 03-structured-json-output.js   ← Get reliable JSON back (the key trick)
│   └── 04-streaming-response.js       ← Token-by-token streaming
├── ai-tasks-api/                      ← Day 07's tasks-api + AI routes
│   ├── server.js                      ← + AI router mount
│   ├── config/db.js                   ← Same as day 07
│   ├── models/Task.js                 ← + tags + subtasks fields
│   ├── routes/
│   │   ├── tasks.js                   ← Same CRUD as day 07
│   │   └── ai.js                      ← NEW: 4 AI endpoints
│   ├── services/claude.js             ← Claude SDK wrapper + cost log
│   ├── middleware/{logger,errorHandler}.js
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── postman-collection.json
└── client/                            ← Day 07 React + AI buttons per task
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/{main.jsx, App.jsx, api.js}
```

---

## 🎯 Today's Running Order (90 min core + 30 min Q&A)

| # | Mins | Topic | Files |
|---|------|-------|-------|
| 1 | 10 | Recap day 07 + "Why AI as a feature?" | — |
| 2 | 10 | Anthropic API key signup walkthrough | console.anthropic.com |
| 3 | 15 | `examples/01` → `04` — SDK basics | `examples/*.js` |
| 4 | 10 | Cost + token awareness (super important) | `services/claude.js` |
| 5 | 20 | AI endpoints walkthrough — categorize / enhance / suggest / chat | `routes/ai.js` |
| 6 | 10 | **Postman demo** — hit each AI endpoint | `postman-collection.json` |
| 7 | 15 | React frontend — "✨ AI" buttons per task | `client/src/{App.jsx, api.js}` |
| 8 | 30 | Q&A + homework brief | — |

---

## 1️⃣ Anthropic API Key Setup

### 1a. Sign up

1. Open https://console.anthropic.com
2. Sign up with email + verify
3. Free credit eka — typically $5 free trial credit eka enewa new accounts walata
4. **Add payment method** eka mulin karaganna — without it API calls fail with "credit balance too low" even with free credit (Anthropic policy)

### 1b. Generate API key

1. Console → **API Keys** → **Create Key**
2. Name: `day08-class` (or anything)
3. Copy the key — starts with `sk-ant-api03-...`
4. ⚠️ **Copy it ONCE — won't be shown again.** Lose karagaththama wenak ekak hadanawatama

### 1c. .env file

```bash
cd ai-tasks-api
cp .env.example .env
# Edit .env:
#   ANTHROPIC_API_KEY=sk-ant-api03-paste-your-key-here
#   ANTHROPIC_MODEL=claude-sonnet-4-5
#   MONGO_URI=mongodb://localhost:27017/day08tasks
```

> ⚠️ **NEVER commit `.env` to git.** Real-world apps eke biggest leak vector eka `.env` files Github eke pannapu eka. `.gitignore` walata `.env` add wela thiyenne, eth oya manually karagaththa nm yeah double-check karanna.

---

## 2️⃣ Examples — concept-by-concept (15 min)

```bash
cd examples
npm install @anthropic-ai/sdk dotenv     # Or reuse ai-tasks-api/node_modules
# Make sure .env or ANTHROPIC_API_KEY env var is set
node 01-first-claude-call.js             # Hello Claude
node 02-system-and-user-prompts.js       # Persona + question
node 03-structured-json-output.js        # JSON output trick
node 04-streaming-response.js            # Streaming
```

### File-by-file teaching points

**01-first-claude-call.js**
- The SDK is `@anthropic-ai/sdk` (npm package)
- `client.messages.create()` is THE main method
- `model`, `max_tokens`, `messages[]` are required
- Response has `.content[0].text` + `.usage.input_tokens` + `.usage.output_tokens`

**02-system-and-user-prompts.js**
- **System prompt** = persona / rules / context that always applies
- **User message** = the actual question / input
- Same user question + different system prompt = totally different answers
- Live demo: change the system prompt mid-class, re-run, watch the personality shift

**03-structured-json-output.js** ⭐ Most important
- LLMs naturally output prose. For programs, we need **JSON**.
- Trick 1: explicit instruction in the prompt — "Output strict JSON. No markdown."
- Trick 2: provide a schema in the prompt
- Trick 3: parse defensively — strip markdown fences if present
- This is the foundation of every "AI feature" inside a backend

**04-streaming-response.js**
- `client.messages.stream()` instead of `.create()`
- Returns an event emitter — `.on('text', chunk => ...)` fires per token
- Used for "ChatGPT-like" typing effect in UIs
- Server-Sent Events (SSE) is how we deliver it to the browser (covered in route)

---

## 3️⃣ The AI Service Layer

Open `ai-tasks-api/services/claude.js`. **Key teaching points:**

1. **Single client instance** — re-used across requests (not created per-call)
2. **Wrapper around `messages.create`** — adds logging + cost tracking
3. **Token pricing table** — claude-sonnet-4-5 = $3 input / $15 output per 1M tokens
4. **`extractJson()` helper** — strips markdown fences, finds first `{`, parses
5. **Total spend tracking** — in-memory for class; production walata DB walata save

```js
// Production tip — daily cost cap pattern from real apps:
if (todaySpent >= DAILY_CAP) throw new Error("Daily AI cost cap hit");
```

> Real-world story (live class): මගේ Canada immigration FB content automator eke same Claude SDK use karanawa. Daily cap $1, alert at 50% + 80%. Without that = $50 mistake one bad loop ekata.

---

## 4️⃣ AI Endpoints — `routes/ai.js`

| Endpoint | What it does | Cost (~) |
|---|---|---|
| `POST /ai/categorize` | Title → `{ priority, tags[] }` JSON | $0.001 |
| `POST /ai/enhance` | Title → detailed description (60-100 words) | $0.002 |
| `POST /ai/suggest-subtasks/:id` | Task → 3-5 subtasks, optionally save back | $0.003 |
| `POST /ai/chat` | Streaming chat — SSE response | varies |

Each handler follows the same pattern:
1. Validate input
2. Build system + user prompts
3. Call `callClaude()` (or `streamClaude()`)
4. Parse / validate response
5. Optionally update DB
6. Return clean JSON

**Live demo flow:**
1. Create a task with just title "fix login bug" → see priority=medium, tags=[]
2. POST `/ai/categorize` with `{title: "fix login bug"}` → returns `{priority:"high", tags:["bug","auth"]}`
3. POST `/ai/enhance` with `{title: "fix login bug"}` → returns full description
4. Create task via POST `/tasks`, then POST `/ai/suggest-subtasks/:id` → DB updated with subtasks array

---

## 5️⃣ Postman Collection

Import `ai-tasks-api/postman-collection.json` — **8 requests:**

| # | Method | Endpoint | Note |
|---|--------|----------|------|
| 1 | GET    | `/`                        | API info |
| 2 | GET    | `/health`                  | Mongo + AI key presence |
| 3 | POST   | `/tasks`                   | Plain create — gets `taskId` |
| 4 | POST   | `/ai/categorize`           | Title → priority/tags |
| 5 | POST   | `/ai/enhance`              | Title → description |
| 6 | POST   | `/ai/suggest-subtasks/:id` | Updates the task in DB |
| 7 | GET    | `/tasks/:id`               | See subtasks populated |
| 8 | POST   | `/ai/chat`                 | Streaming (Postman renders chunk-by-chunk) |

---

## 6️⃣ React Frontend — AI buttons

```bash
cd ../client
npm install
npm run dev                              # http://localhost:5173
```

Each task card now has:
- **✨ Categorize** button — calls `/ai/categorize`, updates the task's priority + tags
- **✨ Enhance** button — fills in the task description
- **✨ Subtasks** button — generates + displays subtasks below the title

Live demo: type "buy groceries" → Add → click ✨ Categorize → priority "low", tags `["personal","shopping"]` — magic ✨

---

## 🤔 Common Questions

**Q: Why Anthropic Claude vs OpenAI GPT?**
A: SDK shape is similar; for class we pick one and stick. Anthropic walata:
- Free trial $5 credit eka clean
- Lower cost (Sonnet 4.5 = $3/$15 per Mtok vs GPT-5 = $1.25/$10)
- Less aggressive rate limits on free tier
- Stronger JSON adherence + longer context

**Q: API key safe karanne kohomada?**
A:
- ALWAYS `.env` ekata damanawa
- `.gitignore` walata `.env` add karanawa
- Production walata environment variable hetiyatama set karanawa (Vercel, Render, etc.)
- **Frontend eke kelinma use karanna epa** — always proxy through your backend (security + cost control)

**Q: Cost track karagaththama mokakda dekkanne?**
A: Each Claude call returns `usage.input_tokens` + `usage.output_tokens`. Multiply by the price-per-million-tokens. Sum it. Live demo: 10 calls walata ~$0.02. Daily budget set karagena hard-stop karanna mage example walata watch karanna.

**Q: "Output JSON" kiyala instruction una unath sometimes prose enawa, kohomada handle karanne?**
A: `extractJson()` helper eka:
1. Look for first ``` block — extract content
2. If no fence, find first `{` or `[`
3. Try `JSON.parse()`
4. On fail, retry the Claude call (one retry)
This pattern shipping in production code walata standard.

**Q: Streaming walata frontend eka kohomada handle karanne?**
A: SSE (Server-Sent Events) — browser native `EventSource` API. Day 09 walata cover karannan deep, today demo eka witharak.

**Q: Rate limits hit kalama mokakda wenne?**
A: Anthropic returns 429 with `retry-after` header. SDK auto-retries on 429/5xx with exponential backoff. Production walata wrap karagannan a circuit breaker pattern.

---

## 📚 Homework — Submit by next Saturday

Tasks app extend karanna more AI features ekkak. Pick **two** of:

1. **AI Summary endpoint** — `GET /ai/summary?completed=true` → Claude eken 3-line summary of today's completed tasks
2. **Smart sorting** — `GET /ai/sort` → Claude reorders tasks by inferred urgency (use Claude to "reason" about the task list, return a sort order)
3. **Auto-tagging on create** — When `POST /tasks` is called, auto-call `/ai/categorize` server-side and save tags + priority before saving. Add a `?ai=true` query flag to enable.
4. **Daily standup** — `GET /ai/standup` returns a markdown-formatted standup ("Yesterday I completed X, Y. Today I'll do Z. Blockers: ...") based on yesterday's completed tasks + today's pending.
5. **Cost dashboard** — Track Claude calls in a `AiCallLog` Mongoose model. Add `GET /ai/usage` returning daily/weekly cost. Bonus: chart it in React.

Best 3 submissions get **bonus loyalty points** 🏆

---

## 🔗 Useful Links

- Anthropic Console: https://console.anthropic.com
- Anthropic Docs: https://docs.claude.com
- TypeScript/Node SDK: https://github.com/anthropics/anthropic-sdk-typescript
- Pricing reference: https://docs.claude.com/en/docs/about-claude/models/overview
- Prompt library: https://docs.claude.com/en/prompt-library/library

---

## 🚨 What we're NOT covering today (Day 09)

- Streaming UI (frontend SSE handling)
- Function/tool calling (Claude calls your functions)
- Vector embeddings + RAG (retrieve-augmented generation)
- File uploads + PDFs to Claude
- Prompt caching ($)
- Anthropic Batch API (50% cheaper for non-urgent)

Eka tika **Day 09 — AI Integration Part 2** walata. Mehe foundation ekak honda hadagaththama then advanced features make sense.
