// =========================================================
// Tasks REST API — Day 07
// Node.js + Express + MongoDB (Mongoose)
//
// Day 06 walin api Tasks API ekak hadua in-memory data eken.
// Today api eka MongoDB walin replace karala data persist karanawa.
// =========================================================

require('dotenv').config();

const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');
const logger = require('./middleware/logger');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const tasksRouter = require('./routes/tasks');

const app = express();
const PORT = process.env.PORT || 3000;

// ===== Global middleware =====
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

// ===== Routes =====
app.get('/', (req, res) => {
  res.json({
    name: 'Tasks API',
    version: '2.0.0',
    storage: 'MongoDB (Mongoose)',
    endpoints: [
      'GET    /tasks                  — List all tasks',
      'GET    /tasks?completed=true   — Filter by completed',
      'GET    /tasks?priority=high    — Filter by priority',
      'GET    /tasks/:id              — Get one task',
      'POST   /tasks                  — Create task',
      'PUT    /tasks/:id              — Update task',
      'DELETE /tasks/:id              — Remove task',
      'GET    /health                 — Health check'
    ],
    docs: 'See README.md for Postman setup'
  });
});

app.get('/health', (req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const mongoose = require('mongoose');
  res.json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    env: process.env.NODE_ENV,
    mongo: states[mongoose.connection.readyState] || 'unknown'
  });
});

app.use('/tasks', tasksRouter);

// ===== Error handlers (must be LAST) =====
app.use(notFound);
app.use(errorHandler);

// ===== Boot =====
(async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`✅ Tasks API running at http://localhost:${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`   Try: GET http://localhost:${PORT}/tasks`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    });
  } catch (err) {
    console.error('❌ Boot failed:', err.message);
    process.exit(1);
  }
})();
