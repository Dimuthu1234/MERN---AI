// =========================================================
// AI Tasks API — Day 08
// Node.js + Express + MongoDB + Anthropic Claude SDK
//
// Day 07 walin built CRUD api eka extend kara — 4 new AI endpoints
// under /ai/* — categorize, enhance, suggest-subtasks, chat.
// =========================================================

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const connectDB = require('./config/db');
const logger = require('./middleware/logger');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const tasksRouter = require('./routes/tasks');
const aiRouter = require('./routes/ai');
const { getDailySpend } = require('./services/claude');

const app = express();
const PORT = process.env.PORT || 3000;

// ===== Global middleware =====
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(logger);

// ===== Routes =====
app.get('/', (req, res) => {
  res.json({
    name: 'AI Tasks API',
    version: '3.0.0',
    storage: 'MongoDB (Mongoose)',
    ai: 'Anthropic Claude (' + (process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5') + ')',
    endpoints: [
      '— CRUD (same as day 07) —',
      'GET    /tasks                            — list',
      'GET    /tasks/:id                        — one',
      'POST   /tasks                            — create',
      'PUT    /tasks/:id                        — update',
      'DELETE /tasks/:id                        — delete',
      '— AI (new in day 08) —',
      'POST   /ai/categorize                    { title } → { priority, tags[] }',
      'POST   /ai/enhance                       { title } → { description }',
      'POST   /ai/suggest-subtasks/:id          → saves subtasks[] to the task',
      'POST   /ai/chat                          { prompt } → SSE stream',
      'GET    /ai/usage                         → today\'s call count + spend',
      'GET    /health                           → uptime + Mongo + AI key presence',
    ],
  });
});

app.get('/health', (req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const spend = getDailySpend();
  res.json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    env: process.env.NODE_ENV,
    mongo: states[mongoose.connection.readyState] || 'unknown',
    ai: {
      keyPresent: Boolean(process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.startsWith('sk-ant-')),
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5',
      callsToday: spend.calls,
      spentUsdToday: spend.usd,
    },
  });
});

app.use('/tasks', tasksRouter);
app.use('/ai', aiRouter);

// ===== Error handlers (must be LAST) =====
app.use(notFound);
app.use(errorHandler);

// ===== Boot =====
(async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`✅ AI Tasks API running at http://localhost:${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`   Anthropic key present: ${Boolean(process.env.ANTHROPIC_API_KEY)}`);
      console.log(`   Try: GET http://localhost:${PORT}/`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    });
  } catch (err) {
    console.error('❌ Boot failed:', err.message);
    process.exit(1);
  }
})();
