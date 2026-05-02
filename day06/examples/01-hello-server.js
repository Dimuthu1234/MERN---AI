// Example 1: Hello Express Server
// ================================
// Run: node 01-hello-server.js
// Then open: http://localhost:3000

const express = require('express');
const app = express();

const PORT = 3000;

// Route 1: Plain text response
app.get('/', (req, res) => {
  res.send('<h1>👋 Hello from AcademyDSJ!</h1><p>Welcome to your first Express server.</p>');
});

// Route 2: JSON response
app.get('/about', (req, res) => {
  res.json({
    name: 'AcademyDSJ',
    year: 2026,
    students: 350,
    course: 'MERN + AI'
  });
});

// Route 3: URL parameter
app.get('/greet/:name', (req, res) => {
  const { name } = req.params;
  res.send(`Hello, ${name}! 🎉`);
});

// Route 4: Status code
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`   Try: GET /  /about  /greet/Dimuthu  /health`);
});
