// server/routes/ai.routes.js
import { Router } from "express";
import Anthropic from "@anthropic-ai/sdk";
import {
  semanticSearch,
  generateProductContent,
  recommend,
  CHAT_TOOLS,
  runChatTool,
} from "../services/ai.service.js";
import Product from "../models/Product.js";

const router = Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = "claude-sonnet-4-6";

// Feature 1
router.post("/search", async (req, res) => {
  try {
    const data = await semanticSearch(req.body.query || "");
    res.json({ success: true, data });
  } catch (e) {
    res.json({ success: false, error: "Search failed", data: [] });
  }
});

// Feature 3
router.post("/generate-content", async (req, res) => {
  try {
    const { name, category } = req.body;
    const data = await generateProductContent(name, category);
    res.json({ success: true, data });
  } catch (e) {
    res.json({ success: false, error: "Generation failed" });
  }
});

// Feature 4
router.post("/recommend", async (req, res) => {
  try {
    const data = await recommend(req.body);
    res.json({ success: true, data });
  } catch (e) {
    res.json({ success: false, error: "Recommend failed", data: [] });
  }
});

// Feature 2 — streaming chat with tool-use loop (SSE)
router.post("/chat", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  const send = (obj) => res.write(`data: ${JSON.stringify(obj)}\n\n`);

  try {
    const products = await Product.find().lean();
    const catalog = products
      .map((p) => `id:${p._id} | ${p.name} | ${p.category} | LKR ${p.price}`)
      .join("\n");
    const system =
      "You are ShopWave's shopping assistant. Only recommend products from " +
      "the catalog. Never invent products or prices. Use tools to search and " +
      "add to cart. Be concise and friendly.\n\nCatalog:\n" + catalog;

    let convo = [...(req.body.messages || [])];

    for (let hop = 0; hop < 5; hop++) {
      const stream = anthropic.messages.stream({
        model: MODEL,
        max_tokens: 1024,
        system,
        tools: CHAT_TOOLS,
        messages: convo,
      });

      stream.on("text", (t) => send({ type: "text", text: t }));
      const final = await stream.finalMessage();

      const toolUses = final.content.filter((b) => b.type === "tool_use");
      if (toolUses.length === 0) break;

      convo.push({ role: "assistant", content: final.content });
      const results = [];
      for (const tu of toolUses) {
        const out = await runChatTool(tu.name, tu.input);
        if (tu.name === "add_to_cart" && out.added) {
          send({ type: "cart_add", name: out.name });
        }
        results.push({
          type: "tool_result",
          tool_use_id: tu.id,
          content: JSON.stringify(out),
        });
      }
      convo.push({ role: "user", content: results });
    }
    send({ type: "done" });
    res.end();
  } catch (e) {
    send({ type: "error", message: "Assistant unavailable" });
    res.end();
  }
});

export default router;
