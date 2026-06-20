import express from 'express';
import { Document } from '../models/Document.js';
import { summariseDocument } from '../services/ai.service.js';

const aiRouter = express.Router();

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
