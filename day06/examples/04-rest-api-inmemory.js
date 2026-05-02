// Example 4: Full REST API (in-memory data)
// ==========================================
// Same Tasks API as the slides — single file version for quick demo.
// Run: node 04-rest-api-inmemory.js
//
// Then in Postman:
//   GET    http://localhost:3000/tasks
//   GET    http://localhost:3000/tasks?completed=true
//   GET    http://localhost:3000/tasks/2
//   POST   http://localhost:3000/tasks       body: { "title": "Learn Express" }
//   PUT    http://localhost:3000/tasks/1     body: { "completed": true }
//   DELETE http://localhost:3000/tasks/3

const express = require('express');
const app = express();

app.use(express.json());

// In-memory "database"
let tasks = [
  { id: 1, title: 'Setup Node.js',   completed: true,  priority: 'high' },
  { id: 2, title: 'Build first API', completed: false, priority: 'high' },
  { id: 3, title: 'Add validation',  completed: false, priority: 'medium' }
];
let nextId = 4;

// ===== READ ALL (with optional ?completed=true filter) =====
app.get('/tasks', (req, res) => {
  const { completed } = req.query;
  if (completed === 'true')  return res.json(tasks.filter(t =>  t.completed));
  if (completed === 'false') return res.json(tasks.filter(t => !t.completed));
  res.json(tasks);
});

// ===== READ ONE =====
app.get('/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id == req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
});

// ===== CREATE =====
app.post('/tasks', (req, res) => {
  const { title, priority } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'title is required' });
  }

  const newTask = {
    id: nextId++,
    title: title.trim(),
    completed: false,
    priority: priority || 'medium'
  };
  tasks.push(newTask);

  res.status(201).json(newTask);
});

// ===== UPDATE (partial) =====
app.put('/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id == req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  Object.assign(task, req.body, { id: task.id });
  res.json(task);
});

// ===== DELETE =====
app.delete('/tasks/:id', (req, res) => {
  const before = tasks.length;
  tasks = tasks.filter(t => t.id != req.params.id);
  if (tasks.length === before) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.status(204).end();
});

app.listen(3000, () => {
  console.log('✅ Tasks API running at http://localhost:3000');
  console.log('   3 endpoints to start: GET /tasks, POST /tasks, DELETE /tasks/:id');
});
