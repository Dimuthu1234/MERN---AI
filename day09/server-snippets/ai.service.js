// server/services/ai.service.js
// SHARED Anthropic client. ALL AI features go through here.
import Anthropic from "@anthropic-ai/sdk";
import Product from "../models/Product.js";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = "claude-sonnet-4-6";

// Build a grounded catalog context string from live DB data.
async function getCatalogContext(filter = {}) {
  const products = await Product.find(filter).lean();
  const text = products
    .map(
      (p) =>
        `id:${p._id} | ${p.name} | ${p.category} | LKR ${p.price} | stock:${p.stock} | ${p.description}`
    )
    .join("\n");
  return { products, text };
}

// Strip ```json fences and parse safely.
function safeJson(raw) {
  const clean = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

// ---- Feature 1: Semantic Search ----
export async function semanticSearch(query) {
  const { products, text } = await getCatalogContext();
  const msg = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 512,
    system:
      "You rank products for a shopper. Use ONLY the provided catalog. " +
      "Return ONLY a JSON array of product ids, most relevant first. No prose.",
    messages: [
      {
        role: "user",
        content: `Catalog:\n${text}\n\nShopper query: "${query}"\nReturn JSON array of matching ids.`,
      },
    ],
  });
  const ids = safeJson(msg.content.find((b) => b.type === "text").text);
  // Preserve Claude's ranking order.
  const byId = new Map(products.map((p) => [String(p._id), p]));
  return ids.map((id) => byId.get(String(id))).filter(Boolean);
}

// ---- Feature 3: Content Generation (structured JSON) ----
export async function generateProductContent(name, category) {
  const msg = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 700,
    system:
      "You are an e-commerce copywriter. Respond with ONLY valid JSON, " +
      "no markdown, no preamble.",
    messages: [
      {
        role: "user",
        content:
          `Product: "${name}", category: "${category}".\n` +
          `Return JSON: { "description": string (2-3 sentences), ` +
          `"seoTags": string[] (6 tags), "marketingCopy": string (1 punchy line) }`,
      },
    ],
  });
  return safeJson(msg.content.find((b) => b.type === "text").text);
}

// ---- Feature 4: Recommendations ----
export async function recommend({ currentProductId, cartItemIds = [] }) {
  const { products, text } = await getCatalogContext();
  const exclude = new Set([currentProductId, ...cartItemIds].map(String));
  const msg = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 256,
    system:
      "Recommend complementary products from the catalog only. " +
      "Return ONLY a JSON array of up to 4 product ids. No prose.",
    messages: [
      {
        role: "user",
        content: `Catalog:\n${text}\n\nCurrent product id: ${currentProductId}\nIn cart: ${
          cartItemIds.join(", ") || "none"
        }\nReturn JSON array of up to 4 complementary in-stock ids, excluding current/cart items.`,
      },
    ],
  });
  const ids = safeJson(msg.content.find((b) => b.type === "text").text).filter(
    (id) => !exclude.has(String(id))
  );
  const byId = new Map(products.map((p) => [String(p._id), p]));
  return ids.map((id) => byId.get(String(id))).filter(Boolean).slice(0, 4);
}

// ---- Feature 2: Chat assistant with tool use (streaming) ----
// Tools Claude can call. The route handler executes them.
export const CHAT_TOOLS = [
  {
    name: "search_products",
    description: "Search the catalog for products matching a query.",
    input_schema: {
      type: "object",
      properties: { query: { type: "string" } },
      required: ["query"],
    },
  },
  {
    name: "add_to_cart",
    description: "Add a product to the shopper's cart by product id.",
    input_schema: {
      type: "object",
      properties: { productId: { type: "string" } },
      required: ["productId"],
    },
  },
];

export async function runChatTool(name, input) {
  if (name === "search_products") {
    const results = await semanticSearch(input.query);
    return results.slice(0, 5).map((p) => ({
      id: String(p._id),
      name: p.name,
      price: p.price,
      category: p.category,
    }));
  }
  if (name === "add_to_cart") {
    const p = await Product.findById(input.productId).lean();
    return p ? { added: true, name: p.name } : { added: false };
  }
  return { error: "unknown tool" };
}

// Non-streaming chat turn that resolves the full tool-use loop.
// (See ai.routes.js for the streaming variant used by the widget.)
export async function chat(messages) {
  const { text } = await getCatalogContext();
  const system =
    "You are ShopWave's shopping assistant. Only recommend products from the " +
    "catalog below. Never invent products or prices. Use tools to search and " +
    "add to cart. Be concise and friendly.\n\nCatalog:\n" +
    text;

  let convo = [...messages];
  for (let hop = 0; hop < 5; hop++) {
    const res = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system,
      tools: CHAT_TOOLS,
      messages: convo,
    });

    const toolUses = res.content.filter((b) => b.type === "tool_use");
    if (toolUses.length === 0) {
      return res.content.find((b) => b.type === "text")?.text ?? "";
    }

    convo.push({ role: "assistant", content: res.content });
    const toolResults = [];
    for (const tu of toolUses) {
      const out = await runChatTool(tu.name, tu.input);
      toolResults.push({
        type: "tool_result",
        tool_use_id: tu.id,
        content: JSON.stringify(out),
      });
    }
    convo.push({ role: "user", content: toolResults });
  }
  return "Sorry, I couldn't complete that — please try rephrasing.";
}
