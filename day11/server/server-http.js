// server/server-http.js — HTTP server version of TaskFlow MCP.
//
// This exposes all MCP tools as REST endpoints so web clients (Claude Web,
// ChatGPT, etc.) can call them. Same tools, same store, different transport.
//
// Run with: PORT=3000 node server-http.js
// Access at: http://localhost:3000/api/tools/list, /api/tools/add_task, etc.

import express from "express";
import cors from "cors";
import { z } from "zod";
import {
  listTasks,
  addTask,
  completeTask,
  updateTask,
  deleteTask,
} from "./store.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Helper: format a task for display
const fmt = (t) =>
  `[${t.id}] ${t.title} — ${t.priority} priority, ${t.status}` +
  (t.due ? `, due ${t.due}` : "");

// Helper: return success/error response
const ok = (data) => ({ ok: true, data });
const err = (message) => ({ ok: false, error: message });
const toolResult = (text) => ({ ok: true, data: { content: [{ type: "text", text }] } });

// --- Tool endpoints ---

// GET /api/tools/list — list all available tools
app.get("/api/tools/list", (req, res) => {
  const tools = [
    { name: "add_task", description: "Add a new task" },
    { name: "list_tasks", description: "List tasks by status" },
    { name: "complete_task", description: "Mark a task as done" },
    { name: "update_task", description: "Update a task" },
    { name: "delete_task", description: "Delete a task" },
    { name: "search_tasks", description: "Search tasks by title" },
  ];
  res.json(ok(tools));
});

// POST /api/tools/add_task
app.post("/api/tools/add_task", (req, res) => {
  try {
    const schema = z.object({
      title: z.string().min(1),
      priority: z.enum(["low", "medium", "high"]).optional(),
      due: z.string().optional(),
    });
    const input = schema.parse(req.body);
    const task = addTask(input);
    res.json(
      toolResult(
        `Added task ${task.id}: "${task.title}" (${task.priority} priority).`
      )
    );
  } catch (e) {
    res.status(400).json(err(e.message));
  }
});

// POST /api/tools/list_tasks
app.post("/api/tools/list_tasks", (req, res) => {
  try {
    const schema = z.object({
      status: z.enum(["all", "pending", "done"]).optional(),
    });
    const input = schema.parse(req.body || {});
    const tasks = listTasks(input.status ?? "all");
    if (tasks.length === 0) {
      res.json(
        toolResult(
          `No ${input.status && input.status !== "all" ? input.status + " " : ""}tasks found.`
        )
      );
    } else {
      res.json(toolResult(tasks.map(fmt).join("\n")));
    }
  } catch (e) {
    res.status(400).json(err(e.message));
  }
});

// POST /api/tools/complete_task
app.post("/api/tools/complete_task", (req, res) => {
  try {
    const schema = z.object({ id: z.string().min(1) });
    const input = schema.parse(req.body);
    const task = completeTask(input.id);
    if (!task) {
      res.json(toolResult(`No task found with id ${input.id}.`));
    } else {
      res.json(
        toolResult(`Completed task ${task.id}: "${task.title}".`)
      );
    }
  } catch (e) {
    res.status(400).json(err(e.message));
  }
});

// POST /api/tools/update_task
app.post("/api/tools/update_task", (req, res) => {
  try {
    const schema = z.object({
      id: z.string().min(1),
      title: z.string().min(1).optional(),
      priority: z.enum(["low", "medium", "high"]).optional(),
      due: z.string().optional(),
    });
    const input = schema.parse(req.body);
    const task = updateTask(input.id, input);
    if (!task) {
      res.json(toolResult(`No task found with id ${input.id}.`));
    } else {
      res.json(toolResult(`Updated task ${task.id}: ${fmt(task)}.`));
    }
  } catch (e) {
    res.status(400).json(err(e.message));
  }
});

// POST /api/tools/delete_task
app.post("/api/tools/delete_task", (req, res) => {
  try {
    const schema = z.object({ id: z.string().min(1) });
    const input = schema.parse(req.body);
    const ok_result = deleteTask(input.id);
    res.json(
      toolResult(
        ok_result ? `Deleted task ${input.id}.` : `No task found with id ${input.id}.`
      )
    );
  } catch (e) {
    res.status(400).json(err(e.message));
  }
});

// POST /api/tools/search_tasks
app.post("/api/tools/search_tasks", (req, res) => {
  try {
    const schema = z.object({ query: z.string().min(1) });
    const input = schema.parse(req.body);
    const all = listTasks("all");
    const matches = all.filter((t) =>
      t.title.toLowerCase().includes(input.query.toLowerCase())
    );
    if (matches.length === 0) {
      res.json(toolResult(`No tasks matching "${input.query}" found.`));
    } else {
      res.json(
        toolResult(`Found ${matches.length} task(s):\n${matches.map(fmt).join("\n")}`)
      );
    }
  } catch (e) {
    res.status(400).json(err(e.message));
  }
});

// --- Resource endpoints ---

// GET /api/resources/tasks-all — the tasks://all resource as JSON
app.get("/api/resources/tasks-all", (req, res) => {
  const tasks = listTasks("all");
  res.json(ok(tasks));
});

// --- Prompt endpoints ---

// GET /api/prompts/daily_standup — the daily_standup prompt template
app.get("/api/prompts/daily_standup", (req, res) => {
  res.json(
    ok({
      title: "Daily standup",
      description: "Summarise the current tasks into a short standup.",
      message:
        "Look at my current tasks and give me a short daily standup with " +
        "three sections — Done, Doing, and Blockers. Keep it to a few bullet " +
        "points; pull 'Done' from completed tasks and 'Doing' from pending " +
        "ones, and call out anything overdue as a blocker.",
    })
  );
});

// --- Health check ---

app.get("/health", (req, res) => {
  res.json({ ok: true, server: "TaskFlow MCP HTTP", timestamp: new Date().toISOString() });
});

// 404 catch-all
app.use((req, res) => {
  res.status(404).json(err("Not found. Available: /api/tools/*, /api/resources/*, /health"));
});

// Start server
app.listen(PORT, () => {
  console.error(`TaskFlow HTTP server running on http://localhost:${PORT}`);
  console.error(`  Tools: POST /api/tools/<name>`);
  console.error(`  Resources: GET /api/resources/tasks-all`);
  console.error(`  Health: GET /health`);
});
