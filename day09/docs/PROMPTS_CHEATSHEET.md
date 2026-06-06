# PROMPTS_CHEATSHEET.md — ShopWave AI

Copy-paste these into Claude Code in order during the live class. Each follows **Goal → Constraints → Acceptance**. `CLAUDE.md` is already in the repo root, so Claude has full project context.

---

## Prompt 1 — Scaffold + Backend Core (Block 1)

```
Goal: Scaffold the ShopWave AI backend per CLAUDE.md.

Constraints:
- Create server/ with: index.js, config/db.js, models/Product.js,
  models/Order.js, routes/products.routes.js, seed/seed.js, .env.example.
- Product schema: name, description, category, price (Number, LKR),
  image (url string), stock, tags ([String]).
- products.routes.js: GET /api/products, GET /api/products/:id.
- seed/seed.js: insert 12 realistic products across 4 categories.
- Add package.json scripts: "dev" (nodemon index.js), "seed".
- ES modules. Response shape { success, data } / { success, error }.

Acceptance:
- npm run seed inserts 12 products.
- npm run dev starts server on PORT (default 5000).
- GET /api/products returns the 12 products as JSON.
```

---

## Prompt 2 — Shared AI Service + Semantic Search (Block 2)

```
Goal: Build the shared Anthropic service and Feature 1 (semantic search).

Constraints:
- Create server/services/ai.service.js exporting an initialized Anthropic
  client (model "claude-sonnet-4-6") and these methods (stub the others):
  semanticSearch(query), chat(messages), generateProductContent(name,category),
  recommend(context).
- Implement semanticSearch(query): fetch all products, build a catalog
  context string, ask Claude to return ONLY a JSON array of the best-matching
  product _ids ranked by relevance to the query. Parse safely.
- Create server/routes/ai.routes.js with POST /api/ai/search → returns the
  matched product documents in ranked order.
- Mount ai.routes in index.js. Never import Anthropic outside ai.service.js.

Acceptance:
- POST /api/ai/search { "query": "warm jacket for rain under 5000" }
  returns relevant products, cheapest-fit first, no hallucinated items.
```

---

## Prompt 3 — Frontend Shell + Search UI (Block 3)

```
Goal: Build the React (Vite) client shell with a clean modern UI and wire up AI search.

Constraints:
- Create client/ with Vite + React 18 + Tailwind + React Router.
- src/lib/api.js: fetch wrapper, base URL from env (VITE_API_URL).
- src/context/CartContext.jsx: add/remove/clear, item count, total.
- Components: Navbar (logo, cart badge), ProductCard, AISearchBar, ProductGrid.
- Pages: Home (search bar on top + product grid), ProductPage.
- AISearchBar calls POST /api/ai/search; show "AI is finding matches…" state;
  render ranked results in the grid.
- UI/UX: generous whitespace, rounded-2xl cards, soft shadows, a single accent
  color, smooth hover transitions. Make it feel premium, not a template.

Acceptance:
- Home loads all products in a responsive grid.
- Typing "something cozy for cold nights" and submitting shows AI-ranked results.
- Add to cart updates the navbar badge.
```

---

## Prompt 4 — AI Chatbot Assistant (Block 4)

```
Goal: Build Feature 2 — a streaming AI shopping assistant with tool use.

Constraints:
- In ai.service.js implement chat(messages): stream from Claude with a system
  prompt that restricts recommendations to the real catalog. Provide two tools:
  search_products(query) and add_to_cart(productId). Handle the tool-use loop:
  when Claude calls a tool, execute server-side and return tool_result, continue.
- ai.routes.js: POST /api/ai/chat streams the assistant reply (SSE or chunked).
- Client: ChatWidget floating button bottom-right, slide-up panel, message list,
  streaming text render, "added to cart" inline confirmations.

Acceptance:
- "I need a gift for my mom under 3000" → assistant recommends real products
  and can add one to the cart via tool call; cart badge updates.
- Reply streams token-by-token.
```

---

## Prompt 5 — AI Content Generation (Block 5)

```
Goal: Build Feature 3 — admin one-click AI content generation.

Constraints:
- ai.service.js generateProductContent(name, category): ask Claude to return
  ONLY JSON { description, seoTags[], marketingCopy }. Parse with try/catch.
- ai.routes.js: POST /api/ai/generate-content.
- Client Admin page: form (name, category) + "Generate with AI" button that
  fills description, tags, and a marketing blurb into the form fields.

Acceptance:
- Entering "Linen Summer Shirt" / "Apparel" + clicking generate fills all
  three fields with coherent, on-brand copy in under a few seconds.
```

---

## Prompt 6 — AI Recommendations Rail (Block 5)

```
Goal: Build Feature 4 — "You might also like" on the product page.

Constraints:
- ai.service.js recommend({ currentProduct, cartItems }): pass current product
  + cart + catalog context; Claude returns ranked _ids of complementary items
  (exclude items already in cart / the current product). Return as JSON array.
- ai.routes.js: POST /api/ai/recommend.
- Client: RecRail component on ProductPage showing 4 recommended ProductCards.

Acceptance:
- Opening any product shows 4 sensible, in-stock recommendations that are not
  the current product.
```

---

## Recovery prompts (if something breaks live)

- **Fix:** `The POST /api/ai/search call returns an empty array. Debug ai.service.js semanticSearch — log the raw Claude response, ensure we parse the JSON array correctly, and handle markdown code fences.`
- **Explain:** `Explain the tool-use loop in chat() in 3 sentences as if teaching intermediate devs.`
- **Style:** `The product grid feels flat. Improve spacing, card elevation, and hover states for a premium feel using Tailwind only.`
