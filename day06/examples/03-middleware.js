// Example 3: Middleware — logger + auth
// ======================================
// Run: node 03-middleware.js
//
// Test:
//   curl http://localhost:3000/health           (public, works)
//   curl http://localhost:3000/admin/users      (401 — no key)
//   curl -H "x-api-key: wrong" .../admin/users  (403)
//   curl -H "x-api-key: secret123" .../admin/users  (200 ✅)

const express = require('express');
const app = express();

app.use(express.json());

// ===== Middleware 1: Global request logger =====
// Runs for EVERY request thanks to app.use()
function logger(req, res, next) {
  const time = new Date().toISOString();
  console.log(`${time}  ${req.method} ${req.url}`);
  next(); // ← Pass control to next middleware/route
}

app.use(logger);

// ===== Middleware 2: Auth check (route-level) =====
function requireApiKey(req, res, next) {
  const key = req.headers['x-api-key'];

  if (!key) {
    return res.status(401).json({ error: 'API key required' });
  }
  if (key !== 'secret123') {
    return res.status(403).json({ error: 'Invalid API key' });
  }

  next(); // ← Auth OK, continue to route handler
}

// ===== Routes =====

// Public route — no auth needed
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Protected: requireApiKey runs FIRST, then handler
app.get('/admin/users', requireApiKey, (req, res) => {
  res.json({ users: ['Dimuthu', 'Nimali', 'Kamal'] });
});

app.get('/admin/stats', requireApiKey, (req, res) => {
  res.json({ totalUsers: 3, activeBatches: 1 });
});

// ===== 404 handler — last middleware =====
app.use((req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.url}` });
});

// ===== Error handler — 4 args (err, req, res, next) =====
app.use((err, req, res, next) => {
  console.error('❌', err.stack);
  res.status(500).json({ error: 'Server error', message: err.message });
});

app.listen(3000, () => {
  console.log('✅ Server on :3000');
  console.log('Watch this terminal — every request gets logged!');
});
