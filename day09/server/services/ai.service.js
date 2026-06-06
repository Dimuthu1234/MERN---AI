// server/services/ai.service.js
// SHARED Anthropic client. ALL AI features go through here.
// Routes must NEVER import the Anthropic SDK directly.
import Anthropic from "@anthropic-ai/sdk";
import Product from "../models/Product.js";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = "claude-sonnet-4-6";

// Build a grounded catalog context string from live DB data.
// Grounding every prompt in real products is what stops Claude inventing items.
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

// Strip ```json fences and parse safely. Returns [] on any malformed output
// so a bad model response degrades to "no results" instead of throwing.
function safeJsonArray(raw) {
  try {
    const clean = String(raw).replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// ---- Feature 1: Semantic Search ----
// Ask Claude to rank catalog ids by relevance to the shopper query.
// Returns the matched Product documents in Claude's ranked order.
export async function semanticSearch(query) {
  const { products, text } = await getCatalogContext();

  const msg = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 512,
    system:
      "You rank products for an online shopper. Use ONLY the products in the " +
      "provided catalog — never invent products or ids. Rank by how well each " +
      "product fits the shopper's intent. Honour any budget or price limit in " +
      "the query (e.g. 'under 5000' means LKR price <= 5000); exclude products " +
      "that violate it. When two products fit equally well, rank the cheaper " +
      "one first. Return ONLY a JSON array of matching product ids, most " +
      "relevant first. No prose, no markdown.",
    messages: [
      {
        role: "user",
        content: `Catalog:\n${text}\n\nShopper query: "${query}"\n\nReturn a JSON array of matching product ids.`,
      },
    ],
  });

  const textBlock = msg.content.find((b) => b.type === "text");
  const ids = safeJsonArray(textBlock?.text);

  // Preserve Claude's ranking order; drop any id not in the live catalog.
  const byId = new Map(products.map((p) => [String(p._id), p]));
  return ids.map((id) => byId.get(String(id))).filter(Boolean);
}

// ---- Feature 2: Chat assistant with tool use (streaming) ----
// Tools Claude can call. The service executes them via runChatTool().
export const CHAT_TOOLS = [
  {
    name: "search_products",
    description:
      "Search the ShopWave catalog for products matching a shopper's need or description.",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Natural-language description of what the shopper wants.",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "add_to_cart",
    description: "Add a product to the shopper's cart by its product id.",
    input_schema: {
      type: "object",
      properties: {
        productId: {
          type: "string",
          description: "The _id of a product from the catalog.",
        },
      },
      required: ["productId"],
    },
  },
];

// Execute a tool call server-side and return a JSON-serialisable result.
export async function runChatTool(name, input) {
  if (name === "search_products") {
    const results = await semanticSearch(input.query || "");
    return results.slice(0, 5).map((p) => ({
      id: String(p._id),
      name: p.name,
      price: p.price,
      category: p.category,
    }));
  }
  if (name === "add_to_cart") {
    const p = await Product.findById(input.productId).lean();
    if (!p) return { added: false };
    // Return the full product so the client can add it to the cart with a real price.
    return {
      added: true,
      name: p.name,
      product: { _id: String(p._id), name: p.name, price: p.price, image: p.image },
    };
  }
  return { error: "unknown tool" };
}

// Streaming chat turn that resolves the full tool-use loop.
// Async generator: yields { type: "text" | "cart_add" } events. The route pipes
// these to the client as SSE — keeping the Anthropic SDK out of the routes.
export async function* chat(messages) {
  const { text: catalog } = await getCatalogContext();
  const system =
    "You are ShopWave's friendly shopping assistant. Only recommend products " +
    "from the catalog below — never invent products, prices, or details. Use " +
    "the search_products tool to find relevant items, and add_to_cart to add a " +
    "product the shopper agrees to. Respect any budget the shopper mentions. " +
    "Be concise, warm, and helpful.\n\nCatalog:\n" +
    catalog;

  const convo = [...messages];

  // Cap the tool-use loop so a misbehaving turn can't spin forever.
  for (let hop = 0; hop < 5; hop++) {
    const stream = anthropic.messages.stream({
      model: MODEL,
      max_tokens: 1024,
      system,
      tools: CHAT_TOOLS,
      messages: convo,
    });

    // Stream text deltas to the client as they arrive.
    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        yield { type: "text", text: event.delta.text };
      }
    }

    const final = await stream.finalMessage();
    const toolUses = final.content.filter((b) => b.type === "tool_use");

    // No tool calls → the assistant is done.
    if (toolUses.length === 0) return;

    convo.push({ role: "assistant", content: final.content });

    const toolResults = [];
    for (const tu of toolUses) {
      const out = await runChatTool(tu.name, tu.input);
      if (tu.name === "add_to_cart" && out.added) {
        yield { type: "cart_add", name: out.name, product: out.product };
      }
      toolResults.push({
        type: "tool_result",
        tool_use_id: tu.id,
        content: JSON.stringify(out),
      });
    }
    convo.push({ role: "user", content: toolResults });
  }
}

// ---- Feature 3: Content generation (structured JSON) ----
// Returns { description, seoTags: string[], marketingCopy }. Parsed with
// try/catch so a malformed model response throws cleanly for the route to catch.
export async function generateProductContent(name, category) {
  const msg = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 700,
    system:
      "You are an e-commerce copywriter for ShopWave, a modern lifestyle store. " +
      "Write coherent, on-brand copy. Respond with ONLY valid JSON — no markdown, " +
      "no code fences, no preamble.",
    messages: [
      {
        role: "user",
        content:
          `Product name: "${name}", category: "${category}".\n` +
          `Return JSON with exactly these keys: ` +
          `{ "description": string (2-3 sentences), ` +
          `"seoTags": string[] (exactly 6 short lowercase tags), ` +
          `"marketingCopy": string (1 punchy tagline) }`,
      },
    ],
  });

  const textBlock = msg.content.find((b) => b.type === "text");
  try {
    const clean = String(textBlock?.text)
      .replace(/```json|```/g, "")
      .trim();
    const parsed = JSON.parse(clean);
    return {
      description: parsed.description || "",
      seoTags: Array.isArray(parsed.seoTags) ? parsed.seoTags : [],
      marketingCopy: parsed.marketingCopy || "",
    };
  } catch {
    throw new Error("Could not parse generated content");
  }
}

// ---- Feature 4: Recommendations ----
// Reason over the current product + cart + catalog to pick complementary items.
// Excludes the current product and anything already in the cart, and enforces
// in-stock server-side so the model can't surface an out-of-stock item.
export async function recommend({ currentProductId, cartItemIds = [] }) {
  const { products, text } = await getCatalogContext();
  const exclude = new Set([currentProductId, ...cartItemIds].map(String));

  const msg = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 256,
    system:
      "You recommend complementary products for a shopper. Use ONLY products " +
      "from the provided catalog — never invent ids. Prefer items that pair " +
      "well with the current product. Only choose in-stock items. Return ONLY " +
      "a JSON array of up to 4 product ids, most relevant first. No prose.",
    messages: [
      {
        role: "user",
        content:
          `Catalog:\n${text}\n\n` +
          `Current product id: ${currentProductId}\n` +
          `Already in cart: ${cartItemIds.join(", ") || "none"}\n\n` +
          `Return a JSON array of up to 4 complementary, in-stock product ids, ` +
          `excluding the current product and any cart items.`,
      },
    ],
  });

  const textBlock = msg.content.find((b) => b.type === "text");
  const ids = safeJsonArray(textBlock?.text).filter(
    (id) => !exclude.has(String(id))
  );

  const byId = new Map(products.map((p) => [String(p._id), p]));
  return ids
    .map((id) => byId.get(String(id)))
    .filter(Boolean)
    .filter((p) => p.stock > 0)
    .slice(0, 4);
}
