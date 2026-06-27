// server/server.js — the TaskFlow MCP SERVER.
//
// It exposes TOOLS (and later a resource + prompt) over stdio. It never talks to
// Claude — the LLM lives in the host (client/). This file only validates input
// with zod and delegates to store.js.
//
// CRITICAL: stdout is the JSON-RPC channel. NEVER console.log here — it corrupts
// the protocol. Use console.error (stderr) for any logging/debug.

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import {
  listTasks,
  addTask,
  completeTask,
  updateTask,
  deleteTask,
} from "./store.js";

// Small helper: every tool returns MCP text content in the same shape.
const text = (s) => ({ content: [{ type: "text", text: s }] });

// Render one task as a readable line (with its id, the key the model needs).
const fmt = (t) =>
  `[${t.id}] ${t.title} — ${t.priority} priority, ${t.status}` +
  (t.due ? `, due ${t.due}` : "");

const server = new McpServer({ name: "taskflow", version: "1.0.0" });

// --- add_task ------------------------------------------------------------
server.registerTool(
  "add_task",
  {
    description:
      "Add a new task to the task list. Use this when the user wants to " +
      "create, add, or remember a to-do. Returns the new task's id.",
    inputSchema: {
      title: z.string().min(1).describe("What the task is, e.g. 'Finish MCP slides'"),
      priority: z
        .enum(["low", "medium", "high"])
        .optional()
        .describe("Priority; defaults to medium if omitted"),
      due: z
        .string()
        .optional()
        .describe("Optional due date as an ISO date string, e.g. '2026-06-28'"),
    },
  },
  async ({ title, priority, due }) => {
    const task = addTask({ title, priority, due });
    return text(`Added task ${task.id}: "${task.title}" (${task.priority} priority).`);
  }
);

// --- list_tasks ----------------------------------------------------------
server.registerTool(
  "list_tasks",
  {
    description:
      "List tasks, optionally filtered by status. Use this to answer " +
      "'what's pending?', 'what's done?', or 'show all my tasks'. Always " +
      "shows each task's id so other tools can act on it.",
    inputSchema: {
      status: z
        .enum(["all", "pending", "done"])
        .optional()
        .describe("Filter by status; defaults to 'all'"),
    },
  },
  async ({ status }) => {
    const tasks = listTasks(status ?? "all");
    if (tasks.length === 0) {
      return text(`No ${status && status !== "all" ? status + " " : ""}tasks found.`);
    }
    return text(tasks.map(fmt).join("\n"));
  }
);

// --- complete_task -------------------------------------------------------
server.registerTool(
  "complete_task",
  {
    description:
      "Mark a task as done by its id. Use when the user finishes or completes " +
      "a task. If no task has that id, says so.",
    inputSchema: {
      id: z.string().min(1).describe("The task id to complete, e.g. 't1'"),
    },
  },
  async ({ id }) => {
    const task = completeTask(id);
    if (!task) return text(`No task found with id ${id}.`);
    return text(`Completed task ${task.id}: "${task.title}".`);
  }
);

// --- update_task ---------------------------------------------------------
server.registerTool(
  "update_task",
  {
    description:
      "Update an existing task's title, priority, and/or due date by its id. " +
      "Only the fields you pass are changed. Use when the user wants to edit " +
      "or reschedule a task.",
    inputSchema: {
      id: z.string().min(1).describe("The task id to update, e.g. 't1'"),
      title: z.string().min(1).optional().describe("New title"),
      priority: z
        .enum(["low", "medium", "high"])
        .optional()
        .describe("New priority"),
      due: z
        .string()
        .optional()
        .describe("New due date as an ISO date string"),
    },
  },
  async ({ id, title, priority, due }) => {
    const task = updateTask(id, { title, priority, due });
    if (!task) return text(`No task found with id ${id}.`);
    return text(`Updated task ${task.id}: ${fmt(task)}.`);
  }
);

// --- delete_task ---------------------------------------------------------
server.registerTool(
  "delete_task",
  {
    description:
      "Delete a task permanently by its id. Use when the user wants to remove " +
      "or cancel a task. PROD: a destructive action like this should require a " +
      "human approval step.",
    inputSchema: {
      id: z.string().min(1).describe("The task id to delete, e.g. 't1'"),
    },
  },
  async ({ id }) => {
    const ok = deleteTask(id);
    return text(ok ? `Deleted task ${id}.` : `No task found with id ${id}.`);
  }
);

// --- connect over stdio --------------------------------------------------
// The host (our client, Claude Desktop, or Claude Code) spawns this file and
// speaks JSON-RPC over stdio. We just wait for it.
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("TaskFlow MCP server running on stdio.");
