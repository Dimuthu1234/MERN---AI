// All /tasks routes
const express = require('express');
const router = express.Router();
const tasks = require('../data/tasks');

// GET /tasks  — list all (?completed=true|false to filter)
router.get('/', (req, res) => {
  const { completed, priority } = req.query;

  let result = tasks.getAll();
  if (completed === 'true')  result = result.filter(t =>  t.completed);
  if (completed === 'false') result = result.filter(t => !t.completed);
  if (priority) result = result.filter(t => t.priority === priority);

  res.json({ count: result.length, tasks: result });
});

// GET /tasks/:id  — single task
router.get('/:id', (req, res) => {
  const task = tasks.getById(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
});

// POST /tasks  — create new
router.post('/', (req, res) => {
  const { title, priority } = req.body;

  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'title is required (non-empty string)' });
  }

  if (priority && !['low', 'medium', 'high'].includes(priority)) {
    return res.status(400).json({ error: 'priority must be low, medium, or high' });
  }

  const newTask = tasks.create({ title, priority });
  res.status(201).json(newTask);
});

// PUT /tasks/:id  — partial update
router.put('/:id', (req, res) => {
  const updated = tasks.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Task not found' });
  res.json(updated);
});

// DELETE /tasks/:id  — remove
router.delete('/:id', (req, res) => {
  const removed = tasks.remove(req.params.id);
  if (!removed) return res.status(404).json({ error: 'Task not found' });
  res.status(204).end();
});

module.exports = router;
