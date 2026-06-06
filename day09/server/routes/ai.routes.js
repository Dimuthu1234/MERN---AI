// server/routes/ai.routes.js
// All AI work is delegated to ai.service.js — routes never import the
// Anthropic SDK directly (CLAUDE.md hard rule 1).
import { Router } from "express";
import {
  semanticSearch,
  chat,
  generateProductContent,
} from "../services/ai.service.js";

const router = Router();

// Feature 1 — semantic search. Returns matched products in ranked order.
router.post("/search", async (req, res) => {
  try {
    const data = await semanticSearch(req.body.query || "");
    res.json({ success: true, data });
  } catch (e) {
    console.error("AI search failed:", e.message);
    res.json({ success: false, error: "Search failed", data: [] });
  }
});

// Feature 3 — one-click product content generation (structured JSON).
router.post("/generate-content", async (req, res) => {
  try {
    const { name, category } = req.body;
    const data = await generateProductContent(name, category);
    res.json({ success: true, data });
  } catch (e) {
    console.error("AI content generation failed:", e.message);
    res.json({ success: false, error: "Generation failed" });
  }
});

// Feature 2 — streaming chat assistant (SSE). The service yields events; the
// route just forwards them. The Anthropic SDK never enters this file.
router.post("/chat", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  const send = (obj) => res.write(`data: ${JSON.stringify(obj)}\n\n`);

  try {
    for await (const evt of chat(req.body.messages || [])) {
      send(evt);
    }
    send({ type: "done" });
  } catch (e) {
    console.error("AI chat failed:", e.message);
    send({ type: "error", message: "Assistant unavailable" });
  } finally {
    res.end();
  }
});

export default router;
