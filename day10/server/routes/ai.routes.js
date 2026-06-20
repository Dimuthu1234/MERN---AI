import express from 'express';
import { Document } from '../models/Document.js';
import { summariseDocument, streamChat } from '../services/ai.service.js';

const aiRouter = express.Router();

// POST /api/ai/chat  { docId, messages } -> streams the answer as SSE.
// Section 5 (RAG via tool use) + Section 1 (token-by-token streaming).
aiRouter.post('/chat', async (req, res) => {
  const { docId, messages } = req.body;
  if (!docId || !Array.isArray(messages)) {
    return res.status(400).json({ success: false, error: 'docId and messages[] required' });
  }

  // SSE headers — open the stream before any token is written.
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  try {
    await streamChat({ res, docId, messages });
  } catch (err) {
    console.error('[ai] chat error:', err);
    // Section 6: friendly fallback over the stream — never leak the error/key.
    res.write(`data: ${JSON.stringify({ delta: '\n\n⚠️ Sorry, something went wrong.' })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

// POST /api/ai/summarise  { docId } -> { summary, keyPoints[] }
// Section 4 (Slide 22): one-click document summary, structured + safely parsed.
aiRouter.post('/summarise', async (req, res) => {
  try {
    const { docId } = req.body;
    if (!docId) return res.status(400).json({ success: false, error: 'docId required' });

    const doc = await Document.findById(docId).lean();
    if (!doc) return res.status(404).json({ success: false, error: 'Document not found' });

    const data = await summariseDocument(doc.fullText);
    res.json({ success: true, data });
  } catch (err) {
    console.error('[ai] summarise error:', err);
    // Section 6: never leak the error / prompt / key — friendly fallback only.
    res.status(500).json({ success: false, error: 'Could not summarise the document.' });
  }
});

export default aiRouter;
