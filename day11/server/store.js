// server/store.js — TaskFlow's "database": a pure JSON-file task store.
//
// This module owns data/tasks.json and nothing else. It has NO MCP imports and
// no knowledge of Claude — it is plain CRUD over a JSON array. The server layer
// (server.js) validates input with zod, then calls these functions.
//
// PROD: swap JSON store for a real DB (MongoDB/Postgres). The function contract
// below would stay the same; only the read/write internals change.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "data");
const DATA_FILE = join(DATA_DIR, "tasks.json");

// --- file helpers --------------------------------------------------------

// Ensure data/ and data/tasks.json exist; return the parsed array.
function load() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(DATA_FILE)) {
    writeFileSync(DATA_FILE, "[]\n", "utf8");
    return [];
  }
  try {
    const raw = readFileSync(DATA_FILE, "utf8").trim();
    return raw ? JSON.parse(raw) : [];
  } catch {
    // Corrupt/unreadable file: start fresh rather than crash the server.
    return [];
  }
}

function save(tasks) {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2) + "\n", "utf8");
}

// Next stable id: "t1", "t2", ... based on the highest existing numeric suffix.
function nextId(tasks) {
  const max = tasks.reduce((m, t) => {
    const n = parseInt(String(t.id).replace(/^t/, ""), 10);
    return Number.isFinite(n) && n > m ? n : m;
  }, 0);
  return `t${max + 1}`;
}

// --- public API ----------------------------------------------------------

// listTasks(status = "all") → array (filter by status when not "all").
export function listTasks(status = "all") {
  const tasks = load();
  if (status === "all") return tasks;
  return tasks.filter((t) => t.status === status);
}

// addTask({ title, priority?, due? }) → the created task (id + defaults assigned).
export function addTask({ title, priority = "medium", due = null }) {
  const tasks = load();
  const task = {
    id: nextId(tasks),
    title,
    priority,
    status: "pending",
    due: due ?? null,
    createdAt: new Date().toISOString(),
  };
  tasks.push(task);
  save(tasks);
  return task;
}

// getTask(id) → task | undefined.
export function getTask(id) {
  return load().find((t) => t.id === id);
}

// updateTask(id, fields) → updated task | null. Only known fields are applied.
export function updateTask(id, fields = {}) {
  const tasks = load();
  const task = tasks.find((t) => t.id === id);
  if (!task) return null;

  const allowed = ["title", "priority", "due", "status"];
  for (const key of allowed) {
    if (fields[key] !== undefined) task[key] = fields[key];
  }
  save(tasks);
  return task;
}

// completeTask(id) → updated task | null (sets status:"done").
export function completeTask(id) {
  return updateTask(id, { status: "done" });
}

// deleteTask(id) → boolean.
export function deleteTask(id) {
  const tasks = load();
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return false;
  tasks.splice(idx, 1);
  save(tasks);
  return true;
}
