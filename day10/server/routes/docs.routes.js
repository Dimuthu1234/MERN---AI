import express from 'express';
import { Document } from '../models/Document.js';
import { chunkText } from '../services/ai.service.js';

export const docsRouter = express.Router();

// POST /api/docs  { title, fullText } -> chunk it, save, return { id, chunkCount }
docsRouter.post('/', async (req, res) => {
  try {
    const { title, fullText } = req.body;
    if (!fullText?.trim()) {
      return res.status(400).json({ success: false, error: 'fullText required' });
    }
    const chunks = chunkText(fullText);
    const doc = await Document.create({ title: title?.trim() || 'Untitled', fullText, chunks });
    res.status(201).json({ success: true, data: { id: doc._id, chunkCount: chunks.length } });
  } catch (err) {
    console.error('[docs] ingest error:', err);
    res.status(500).json({ success: false, error: 'Could not ingest document.' });
  }
});

// GET /api/docs/:id -> the document (chunks included, fullText omitted to keep it small)
docsRouter.get('/:id', async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id).select('-fullText').lean();
    if (!doc) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({
      success: true,
      data: {
        id: doc._id,
        title: doc.title,
        chunkCount: doc.chunks.length,
        chunks: doc.chunks,
        createdAt: doc.createdAt,
      },
    });
  } catch (err) {
    console.error('[docs] fetch error:', err);
    res.status(500).json({ success: false, error: 'Could not fetch document.' });
  }
});
