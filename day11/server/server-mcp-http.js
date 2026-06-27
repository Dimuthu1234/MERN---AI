// server/server-mcp-http.js — TaskFlow MCP server over HTTP transport.
//
// This exposes the SAME MCP tools/resource/prompt over HTTP (not stdio).
// Compatible with Claude Web's custom connector feature.
//
// Run with: PORT=3001 node server-mcp-http.js

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { HttpServerTransport } from "@modelcontextprotocol/sdk/server/http.js";
import { z } from "zod";

import {
  listTasks,
  addTask,
  completeTask,
  updateTask,
  deleteTask,
} from "./store.js";

// Helper: format task for display
const fmt = (t) =>
  `[${t.id}] ${t.title} — ${t.priority} priority, ${t.status}` +
  (t.due ? `, due ${t.due}` : "");

// Helper: return MCP-shaped response
const text = (s) => ({ content: [{ type: "text", text: s }] });

const server = new McpServer({ name: "taskflow", version: "1.0.0" });

// --- TOOLS (same as server.js) ---

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

server.registerTool(
  "delete_task",
  {
    description:
      "Delete a task permanently by its id. Use when the user wants to remove " +
      "or cancel a task.",
    inputSchema: {
      id: z.string().min(1).describe("The task id to delete, e.g. 't1'"),
    },
  },
  async ({ id }) => {
    const ok = deleteTask(id);
    return text(ok ? `Deleted task ${id}.` : `No task found with id ${id}.`);
  }
);

server.registerTool(
  "search_tasks",
  {
    description:
      "Search tasks by title (case-insensitive substring match). Use when the " +
      "user asks 'do I have anything about X?' or wants to find tasks containing " +
      "specific keywords.",
    inputSchema: {
      query: z
        .string()
        .min(1)
        .describe("The search term to find in task titles, e.g. 'zoom' or 'email'"),
    },
  },
  async ({ query }) => {
    const all = listTasks("all");
    const matches = all.filter((t) =>
      t.title.toLowerCase().includes(query.toLowerCase())
    );
    if (matches.length === 0) {
      return text(`No tasks matching "${query}" found.`);
    }
    return text(`Found ${matches.length} task(s):\n${matches.map(fmt).join("\n")}`);
  }
);

// --- RESOURCE ---

server.registerResource(
  "tasks",
  "tasks://all",
  {
    title: "All tasks",
    description: "The full task list as JSON (read-only).",
    mimeType: "application/json",
  },
  async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: "application/json",
        text: JSON.stringify(listTasks("all"), null, 2),
      },
    ],
  })
);

// --- PROMPT ---

server.registerPrompt(
  "daily_standup",
  {
    title: "Daily standup",
    description: "Summarise the current tasks into a short standup.",
  },
  () => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text:
            "Look at my current tasks and give me a short daily standup with " +
            "three sections — Done, Doing, and Blockers. Keep it to a few bullet " +
            "points; pull 'Done' from completed tasks and 'Doing' from pending " +
            "ones, and call out anything overdue as a blocker.",
        },
      },
    ],
  })
);

// --- HTTP TRANSPORT ---

const PORT = process.env.PORT || 3001;

// HttpServerTransport creates an Express-based server that speaks the MCP protocol.
const transport = new HttpServerTransport();
const app = transport.createServer();

// Basic health check endpoint
app.get("/health", (req, res) => {
  res.json({
    ok: true,
    server: "TaskFlow MCP (HTTP)",
    timestamp: new Date().toISOString(),
  });
});

// Start the server
app.listen(PORT, () => {
  console.error(
    `TaskFlow MCP HTTP server running on http://localhost:${PORT}`
  );
  console.error(`  MCP protocol endpoint: /mcp`);
  console.error(`  Health check: GET /health`);
  console.error(`\nClaude Web connector URL: http://localhost:${PORT}/mcp`);
});

// Connect server to transport
await server.connect(transport);
