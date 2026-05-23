// =========================================================
// /ai routes — the 4 AI endpoints introduced in Day 08
//
//   POST  /ai/categorize             title       → { priority, tags[] }
//   POST  /ai/enhance                title       → { description }
//   POST  /ai/suggest-subtasks/:id   taskId      → 3-5 subtasks (saved to DB)
//   POST  /ai/chat                   prompt      → streaming SSE response
//
//   GET   /ai/usage                              → today's call count + spend
// =========================================================

const express = require('express');
const Task = require('../models/Task');
const { callClaude, streamClaude, extractJson, getDailySpend } = require('../services/claude');

const router = express.Router();

// ─────────────────────────────────────────────────────────
// 1. POST /ai/categorize
//    Body: { title: string }
//    Returns: { priority, tags[] }
// ─────────────────────────────────────────────────────────
const CATEGORIZE_SYSTEM = `You categorize task titles for a to-do app.

Given a task title, return:
  - priority: one of "low" | "medium" | "high"
  - tags: 2 to 4 short lowercase keywords describing the task

Examples:
  Input: "fix the login bug crashing prod"
  Output: { "priority": "high", "tags": ["bug","auth","production"] }

  Input: "buy milk"
  Output: { "priority": "low", "tags": ["shopping","personal"] }

OUTPUT RULES:
- Strict JSON only. No markdown. No commentary outside the JSON.
- Tags are lowercase, single-word or hyphenated, no spaces.

Schema:
{ "priority": "low|medium|high", "tags": ["string", ...] }`;

router.post('/categorize', async (req, res, next) => {
  try {
    const { title } = req.body || {};
    if (!title || typeof title !== 'string') {
      return res.status(400).json({ error: 'title (string) is required' });
    }

    const { text, costUsd } = await callClaude({
      system: CATEGORIZE_SYSTEM,
      user: `Task title: "${title}"\n\nReturn the JSON.`,
      maxTokens: 200,
      temperature: 0.2,
    });

    const parsed = extractJson(text);

    // Defensive validation — don't trust the LLM blindly
    const VALID = ['low', 'medium', 'high'];
    if (!VALID.includes(parsed.priority)) parsed.priority = 'medium';
    parsed.tags = Array.isArray(parsed.tags)
      ? parsed.tags.filter((t) => typeof t === 'string' && /^[a-z0-9-]+$/i.test(t)).slice(0, 4)
      : [];

    res.json({ ...parsed, _costUsd: costUsd });
  } catch (err) { next(err); }
});

// ─────────────────────────────────────────────────────────
// 2. POST /ai/enhance
//    Body: { title: string }
//    Returns: { description: string }
// ─────────────────────────────────────────────────────────
const ENHANCE_SYSTEM = `You expand short task titles into clear, actionable descriptions.

Given a short title, output a 2-4 sentence description (60-100 words) that:
  - Explains WHAT needs to be done
  - Suggests HOW (a small concrete first step)
  - Mentions any obvious risks or dependencies

Tone: clear, neutral, second person ("you").
Output plain text (no markdown, no quotes around the answer).`;

router.post('/enhance', async (req, res, next) => {
  try {
    const { title } = req.body || {};
    if (!title || typeof title !== 'string') {
      return res.status(400).json({ error: 'title (string) is required' });
    }

    const { text, costUsd } = await callClaude({
      system: ENHANCE_SYSTEM,
      user: `Title: "${title}"\n\nWrite the description.`,
      maxTokens: 250,
      temperature: 0.6,
    });

    const description = text.trim().slice(0, 2000); // schema max is 2000
    res.json({ description, _costUsd: costUsd });
  } catch (err) { next(err); }
});

// ─────────────────────────────────────────────────────────
// 3. POST /ai/suggest-subtasks/:id
//    Param: id = Task ObjectId
//    Returns: { subtasks[], task } — also persists to DB.
// ─────────────────────────────────────────────────────────
const SUBTASK_SYSTEM = `You break tasks into concrete subtasks.

Given a task (title + optional description), output 3-5 subtasks that:
  - Are concrete, single-step actions
  - Are ordered (first thing to do → last thing)
  - Each subtask title is under 80 chars

OUTPUT RULES:
- Strict JSON only. No markdown.
- Schema: { "subtasks": [{ "title": "string" }, ...] }`;

router.post('/suggest-subtasks/:id', async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const userPrompt =
      `Task title: "${task.title}"\n` +
      (task.description ? `Description: "${task.description}"\n` : '') +
      `\nReturn 3-5 subtasks as JSON.`;

    const { text, costUsd } = await callClaude({
      system: SUBTASK_SYSTEM,
      user: userPrompt,
      maxTokens: 400,
      temperature: 0.5,
    });

    const parsed = extractJson(text);

    if (!Array.isArray(parsed.subtasks)) {
      return res.status(502).json({ error: 'AI returned invalid subtasks shape' });
    }

    // Sanitize + cap at 5
    const cleaned = parsed.subtasks
      .filter((s) => s && typeof s.title === 'string')
      .map((s) => ({ title: s.title.trim().slice(0, 200), done: false }))
      .slice(0, 5);

    // Persist to DB
    task.subtasks = cleaned;
    task.aiMeta = { ...task.aiMeta?.toObject?.() || {}, lastSubtaskGenAt: new Date() };
    await task.save();

    res.json({ task, costUsd });
  } catch (err) { next(err); }
});

// ─────────────────────────────────────────────────────────
// 4. POST /ai/chat — STREAMING via Server-Sent Events (SSE)
//    Body: { prompt: string }
//    Response: text/event-stream — each token sent as `data: <chunk>\n\n`
// ─────────────────────────────────────────────────────────
router.post('/chat', async (req, res, next) => {
  try {
    const { prompt } = req.body || {};
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'prompt (string) is required' });
    }

    // SSE response headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    // Disable Nginx buffering for proxied SSE (production-friendly).
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    const stream = streamClaude({
      system: 'You are a friendly helper. Keep replies under 150 words.',
      user: prompt,
      maxTokens: 400,
    });

    let fullText = '';

    stream.on('text', (chunk) => {
      fullText += chunk;
      // SSE format — `data: <payload>\n\n`. JSON-encode to survive newlines.
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    });

    stream.on('end', () => {
      // JSON `full` event — easy to parse from a real client.
      res.write(`event: full\ndata: ${JSON.stringify({ text: fullText })}\n\n`);

      // Plain-text `text` event — one `data:` line per line of output,
      // so Postman shows real line breaks instead of escaped \n.
      const lines = fullText.split('\n').map((l) => `data: ${l}`).join('\n');
      res.write(`event: text\n${lines}\n\n`);

      res.write(`event: done\ndata: {}\n\n`);
      res.end();
    });

    stream.on('error', (err) => {
      res.write(`event: error\ndata: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    });

    // Only abort if the client disconnects BEFORE we finish writing.
    // (req.on('close') fires on every request in Node 16+, so we'd cancel ourselves.)
    res.on('close', () => {
      if (!res.writableEnded) stream.controller?.abort?.();
    });
  } catch (err) { next(err); }
});

// ─────────────────────────────────────────────────────────
// 5. GET /ai/usage — today's call count + spend
// ─────────────────────────────────────────────────────────
router.get('/usage', (req, res) => {
  const spend = getDailySpend();
  const cap = Number(process.env.DAILY_COST_CAP_USD || 1);
  res.json({
    date: spend.date,
    callsToday: spend.calls,
    spentUsd: spend.usd,
    capUsd: cap,
    remainingUsd: Math.max(0, cap - spend.usd),
  });
});

module.exports = router;
