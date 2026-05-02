// =========================================================
// Tasks REST API — Day 06
// Node.js + Express
// =========================================================

require('dotenv').config();

const express = require('express');
const cors = require('cors');

const logger = require('./middleware/logger');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const tasksRouter = require('./routes/tasks');

const app = express();
const PORT = process.env.PORT || 3000;

// ===== Global middleware =====
app.use(cors());                  // Allow React frontend to call us
app.use(express.json());          // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));
app.use(logger);                  // Log every request

// ===== Routes =====
app.get('/', (req, res) => {
  res.json({
    name: 'Tasks API',
    version: '1.0.0',
    endpoints: [
      'GET    /tasks               — List all tasks',
      'GET    /tasks?completed=true — Filter by completed',
      'GET    /tasks/:id           — Get one task',
      'POST   /tasks               — Create task',
      'PUT    /tasks/:id           — Update task',
      'DELETE /tasks/:id           — Remove task',
      'GET    /health              — Health check'
    ],
    docs: 'See README.md for Postman setup'
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    env: process.env.NODE_ENV
  });
});

app.use('/tasks', tasksRouter);

// ===== Error handlers (must be LAST) =====
app.use(notFound);
app.use(errorHandler);

// ===== Start =====
app.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Tasks API running at http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Try: GET http://localhost:${PORT}/tasks`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});
