// Example 2: Routes, Params, Query, Body
// ========================================
// Run: node 02-routes-and-params.js
// Test with curl OR Postman

const express = require('express');
const app = express();

// ⚠️ IMPORTANT: This middleware lets us read req.body for POST/PUT
app.use(express.json());

// 1. URL parameters: /users/:id
//    GET /users/42  →  req.params.id = "42"
app.get('/users/:id', (req, res) => {
  res.json({
    received: 'URL parameter',
    id: req.params.id
  });
});

// 2. Query strings: /search?q=react&limit=10
//    req.query = { q: "react", limit: "10" }
app.get('/search', (req, res) => {
  res.json({
    received: 'Query parameters',
    q: req.query.q || '(empty)',
    limit: req.query.limit || '(empty)'
  });
});

// 3. Request body (POST/PUT): JSON body
//    Try: curl -X POST http://localhost:3000/users \
//           -H "Content-Type: application/json" \
//           -d '{"name":"Dimuthu","age":25}'
app.post('/users', (req, res) => {
  res.status(201).json({
    received: 'Request body',
    body: req.body
  });
});

// 4. All combined: /users/:id  with  ?fields=name,email  +  body
app.put('/users/:id', (req, res) => {
  res.json({
    id: req.params.id,
    fields: req.query.fields,
    updates: req.body
  });
});

// 5. Headers
app.get('/headers', (req, res) => {
  res.json({
    yourBrowser: req.headers['user-agent'],
    yourLanguage: req.headers['accept-language'],
    apiKey: req.headers['x-api-key'] || '(no key sent)'
  });
});

app.listen(3000, () => {
  console.log('✅ Server on http://localhost:3000');
  console.log('Try in Postman:');
  console.log('  GET  /users/42');
  console.log('  GET  /search?q=react&limit=10');
  console.log('  POST /users  body: { "name": "Dimuthu", "age": 25 }');
  console.log('  PUT  /users/42?fields=name  body: { "name": "Updated" }');
  console.log('  GET  /headers');
});
