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

// ---- Feature 2: Chat assistant (implemented in a later block) ----
export async function chat(_messages) {
  throw new Error("chat() not implemented yet");
}

// ---- Feature 3: Content generation (implemented in a later block) ----
export async function generateProductContent(_name, _category) {
  throw new Error("generateProductContent() not implemented yet");
}

// ---- Feature 4: Recommendations (implemented in a later block) ----
export async function recommend(_context) {
  throw new Error("recommend() not implemented yet");
}
