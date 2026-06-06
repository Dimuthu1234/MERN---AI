// server/routes/ai.routes.js
// All AI work is delegated to ai.service.js — routes never import the
// Anthropic SDK directly (CLAUDE.md hard rule 1).
import { Router } from "express";
import { semanticSearch } from "../services/ai.service.js";

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

export default router;
