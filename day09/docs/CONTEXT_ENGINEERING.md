# CONTEXT_ENGINEERING.md — ShopWave AI

The teaching spine of the class. Two layers of context engineering:
**(A)** engineering context *for Claude Code* (so it builds the right app), and
**(B)** engineering context *for the runtime Anthropic API* (so the app's AI features are grounded and useful).

---

## A. Context for Claude Code (build time)

Good output from Claude Code = quality of the context you give it. Three levers:

### 1. CLAUDE.md = persistent project memory
Claude Code reads `CLAUDE.md` before every task. We front-load: stack, file layout, hard rules, naming. Result: it stops guessing and matches our architecture. **Show students the before/after** — ask Claude Code to "add an AI endpoint" with vs. without `CLAUDE.md`.

### 2. Prompt structure: Goal → Constraints → Acceptance
Every prompt in `PROMPTS_CHEATSHEET.md` follows:
- **Goal** — what to build, one sentence.
- **Constraints** — files to touch, patterns to follow ("reuse ai.service.js").
- **Acceptance** — how we'll know it works ("POST returns ranked product IDs").

Vague prompt → vague code. Specific acceptance criteria → Claude self-checks.

### 3. Narrow the blast radius
Tell Claude *which files* to create/edit. "Create `server/routes/ai.routes.js` and a `semanticSearch` method in the existing `ai.service.js`" beats "add search." Less context drift, fewer surprises live.

---

## B. Context for the Anthropic API (run time)

This is what makes the AI features feel "world-best": the model is never guessing about *your* catalog.

### 1. Ground responses in real data
Before any recommendation/search/chat call, we fetch live products from Mongo and inject them as structured context:

```js
const products = await Product.find().lean();
const catalogContext = products.map(p =>
  `id:${p._id} | ${p.name} | ${p.category} | LKR ${p.price} | ${p.description}`
).join("\n");
```

That string goes into the system prompt or a user-turn. Claude can only recommend what actually exists → **no hallucinated products or prices.**

### 2. System prompt = role + rules + format
```
You are ShopWave's shopping assistant. Only recommend products from the
provided catalog. Never invent prices. If nothing fits, say so and suggest
the closest match. Be concise and friendly.
```

### 3. Tool use = let Claude act
We give Claude tools (`search_products`, `add_to_cart`). Claude decides when to call them; our server executes and returns results; Claude continues. This turns chat into action.

### 4. Structured output for content gen
For product descriptions we instruct Claude to return *only* JSON:
```
Respond with ONLY valid JSON, no markdown, no preamble:
{ "description": "...", "seoTags": ["..."], "marketingCopy": "..." }
```
Parse safely with try/catch.

### 5. Token discipline
Don't dump the whole DB every call. For big catalogs: pre-filter by category/price in Mongo, then pass the top N. (We note this live as the "scale to a vector DB" next step.)

---

## The one-line lesson for students

> **Claude is only as smart as the context you engineer. Same API, four features — the difference is the context, not the model.**
