// ─────────────────────────────────────────────────────────────────────────────
// server-core.js — reference for the boring backend plumbing, combined into one
// file for the safety net. In the real repo, split these into the paths shown in
// each banner (CLAUDE.md → Target structure).
// ─────────────────────────────────────────────────────────────────────────────

/* ===== server/config/db.js ===== */
import mongoose from 'mongoose';

export async function connectDB(uri = process.env.MONGODB_URI) {
  await mongoose.connect(uri);
  console.log('✓ MongoDB connected');
}

/* ===== server/models/Document.js ===== */
// (in its own file: `import mongoose from 'mongoose'`)
const documentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  fullText: { type: String, required: true },
  chunks: [{ index: Number, text: String }], // Section 3, Slide 15
  createdAt: { type: Date, default: Date.now },
});
export const Document = mongoose.models.Document || mongoose.model('Document', documentSchema);

/* ===== server/models/Conversation.js  (Prompt 6 bonus, Section 2) ===== */
const conversationSchema = new mongoose.Schema({
  docId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
  messages: [{ role: String, content: String }],
  summary: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});
export const Conversation =
  mongoose.models.Conversation || mongoose.model('Conversation', conversationSchema);

/* ===== server/routes/docs.routes.js ===== */
// import express from 'express';
// import { Document } from '../models/Document.js';
// import { chunkText } from '../services/ai.service.js';
import express from 'express';
import { chunkText } from '../services/ai.service.js';

export const docsRouter = express.Router();

// POST /api/docs  { title, fullText } -> chunk + save
docsRouter.post('/', async (req, res) => {
  try {
    const { title, fullText } = req.body;
    if (!fullText?.trim()) return res.status(400).json({ success: false, error: 'fullText required' });
    const chunks = chunkText(fullText);
    const doc = await Document.create({ title: title || 'Untitled', fullText, chunks });
    res.json({ success: true, data: { id: doc._id, chunkCount: chunks.length } });
  } catch (err) {
    console.error('[docs] error:', err);
    res.status(500).json({ success: false, error: 'Could not ingest document.' });
  }
});

// GET /api/docs/:id
docsRouter.get('/:id', async (req, res) => {
  const doc = await Document.findById(req.params.id).lean();
  if (!doc) return res.status(404).json({ success: false, error: 'Not found' });
  res.json({ success: true, data: { id: doc._id, title: doc.title, chunkCount: doc.chunks.length } });
});

/* ===== server/index.js ===== */
// import express from 'express';
// import cors from 'cors';
// import 'dotenv/config';
// import { connectDB } from './config/db.js';
// import { docsRouter } from './routes/docs.routes.js';
// import aiRouter from './routes/ai.routes.js';
import cors from 'cors';
import 'dotenv/config';
import aiRouter from './routes/ai.routes.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' })); // documents can be large

app.use('/api/docs', docsRouter);
app.use('/api/ai', aiRouter);

const PORT = process.env.PORT || 5000;
await connectDB();
app.listen(PORT, () => console.log(`✓ DocChat AI server on :${PORT}`));

/* ===== server/.env.example =====
ANTHROPIC_API_KEY=sk-ant-xxxxxxxx
MONGODB_URI=mongodb://localhost:27017/docchat
PORT=5000
================================== */

/* ===== server/package.json scripts =====
{
  "type": "module",
  "scripts": { "dev": "nodemon index.js", "start": "node index.js" }
}
======================================== */
