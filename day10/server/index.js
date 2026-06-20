import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import { docsRouter } from './routes/docs.routes.js';
import aiRouter from './routes/ai.routes.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' })); // documents can be large

app.get('/health', (_req, res) => res.json({ success: true, data: { ok: true } }));

app.use('/api/docs', docsRouter);
app.use('/api/ai', aiRouter);

const PORT = process.env.PORT || 5000;

await connectDB();
app.listen(PORT, () => console.log(`✓ DocChat AI server on :${PORT}`));
