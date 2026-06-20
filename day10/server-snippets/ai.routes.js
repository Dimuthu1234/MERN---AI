// server/routes/ai.routes.js
// ─────────────────────────────────────────────────────────────────────────────
// POST /api/ai/chat       — SSE streaming chat over the document (RAG + tool use)
// POST /api/ai/summarise  — structured { summary, keyPoints } for a document
// All AI routes are rate-limited; chat is injection-guarded before any LLM call.
// ─────────────────────────────────────────────────────────────────────────────
import express from 'express';
import { Document } from '../models/Document.js';
import { streamChat, summariseDocument } from '../services/ai.service.js';
import { aiRateLimiter, detectInjection } from '../middleware/safety.js';

const router = express.Router();
router.use(aiRateLimiter); // Section 6, Slide 34

// tiny SSE helper
const sse = (res, obj) => res.write(`data: ${JSON.stringify(obj)}\n\n`);

// POST /api/ai/chat  { docId, messages:[{role,content}] }
router.post('/chat', async (req, res) => {
  const { docId, messages = [] } = req.body;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Section 6, Slide 36: injection gate — refuse WITHOUT calling Claude.
  const lastUser = [...messages].reverse().find((m) => m.role === 'user');
  if (lastUser && detectInjection(lastUser.content)) {
    sse(res, { delta: "I'm sorry, I can't help with that request." });
    sse(res, '[DONE]');
    return res.end();
  }

  try {
    const doc = await Document.findById(docId).lean();
    if (!doc) {
      sse(res, { delta: 'That document was not found. Please load a document first.' });
      sse(res, '[DONE]');
      return res.end();
    }
    await streamChat({ res, chunks: doc.chunks, messages });
  } catch (err) {
    // Section 6, Slide 35: never leak internals — log server-side, send a friendly line.
    console.error('[ai/chat] error:', err);
    sse(res, { delta: 'Something went wrong. Please try again.' });
    sse(res, '[DONE]');
    res.end();
  }
});

// POST /api/ai/summarise  { docId }
router.post('/summarise', async (req, res) => {
  try {
    const doc = await Document.findById(req.body.docId).lean();
    if (!doc) return res.status(404).json({ success: false, error: 'Document not found' });
    const data = await summariseDocument(doc.fullText);
    res.json({ success: true, data });
  } catch (err) {
    console.error('[ai/summarise] error:', err);
    res.status(500).json({ success: false, error: 'Could not summarise the document.' });
  }
});

export default router;
