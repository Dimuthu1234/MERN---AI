// =========================================================
// /tasks routes — now backed by MongoDB via Mongoose
// =========================================================
//
// Day 06: read/write to in-memory array (data/tasks.js)
// Day 07: read/write to MongoDB via Task model
//
// All handlers are async — we use try/catch and forward errors
// to the global errorHandler middleware via next(err).

const express = require('express');
const Task = require('../models/Task');

const router = express.Router();

// GET /tasks  — list (?completed=true|false&priority=high)
router.get('/', async (req, res, next) => {
  try {
    const { completed, priority } = req.query;
    const filter = {};

    if (completed === 'true')  filter.completed = true;
    if (completed === 'false') filter.completed = false;
    if (priority) filter.priority = priority;

    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.json({ count: tasks.length, tasks });
  } catch (err) { next(err); }
});

// GET /tasks/:id  — single task
router.get('/:id', async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) { next(err); }
});

// POST /tasks  — create new
router.post('/', async (req, res, next) => {
  try {
    const task = await Task.create(req.body);
    res.status(201).json(task);
  } catch (err) { next(err); }
});

// PUT /tasks/:id  — partial update
router.put('/:id', async (req, res, next) => {
  try {
    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'Task not found' });
    res.json(updated);
  } catch (err) { next(err); }
});

// DELETE /tasks/:id  — remove
router.delete('/:id', async (req, res, next) => {
  try {
    const removed = await Task.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ error: 'Task not found' });
    res.status(204).end();
  } catch (err) { next(err); }
});

module.exports = router;
