# TaskFlow MCP — Project Context

An MCP system built **live with Claude Code** in a 2-hour class for AcademyDSJ
(MERN + AI Live Batch 2026, **Session — Model Context Protocol (MCP) Part 1**).

**TaskFlow MCP** is an AI task manager you talk to in plain language. You say
*"add a task to finish the MCP slides by tomorrow, high priority"* and the AI
calls a real tool that writes to your task list. *"what's still pending?"* lists
them. *"mark the slides task done"* completes it.

It is built from the **three MCP roles** taught in the slides, end to end:

| MCP concept (slides)        | Where it shows up in TaskFlow                                  |
|-----------------------------|---------------------------------------------------------------|
| 1. Why MCP (M×N → M+N)      | ONE server, reused by TWO hosts (our client + Claude Desktop) |
| 2. Host / Client / Server   | `client/` = host+client, `server/` = server, Claude = the LLM |
| 3. Tools / Resources/Prompts| `add_task`… tools · `tasks://all` resource · `daily_standup`   |
| 4. Transport (stdio)        | client spawns server over **stdio**; later HTTP is discussed  |
| 5. Build a server           | `server/server.js` with the official SDK                      |
| 6. Connect + security       | register in Claude Desktop; validate inputs; least privilege  |

> This package is **not a finished repo** — like day09/day10, Claude Code
> generates the code live from `docs/PROMPTS.md`. This file is the *context* so
> every prompt can stay short and the generated code stays consistent.

## What we are building (two processes, one server)

```
        ┌─────────────────────────┐         ┌──────────────────────────┐
        │  HOST + CLIENT (ours)   │  stdio  │   MCP SERVER (ours)      │
        │  client/chat.js         │◄───────►│   server/server.js       │
        │  - Anthropic Claude API │  JSON-  │   - tools (add/list/…)   │
        │  - tool-use loop        │   RPC   │   - resource tasks://all │
        │  client/mcp-client.js   │         │   - prompt daily_standup │
        └─────────────────────────┘         │   - store → data/tasks.json
                                             └──────────────────────────┘
   THEN: the SAME server is also registered in Claude Desktop / Claude Code
   (a second host) — zero new code. That is the whole point of MCP.
```

- **Our client is the host:** it spawns the server as a child process over stdio,
  lists its tools, and runs the Claude tool-use loop. Running the client = both
  processes are live.
- **The server never talks to Claude.** It only exposes tools/resources/prompts.
  The LLM lives in the host.

## Stack & conventions

- **Runtime:** Node 18+ (or 20+), **ES modules** (`"type": "module"`). No TypeScript —
  plain `.js`, kept small and readable for a live class.
- **MCP SDK:** `@modelcontextprotocol/sdk` (official). Use the **high-level**
  `McpServer` API on the server and the high-level `Client` API on the client.
- **AI provider:** Anthropic Claude. Model: **`claude-sonnet-4-6`** everywhere.
  `ANTHROPIC_API_KEY` lives in the repo-root `.env` (loaded by the client only).
  Never import `@anthropic-ai/sdk` anywhere except `client/`.
- **Validation:** `zod` for every tool's input schema. No unvalidated input
  reaches the store.
- **Storage:** a single JSON file `data/tasks.json` (array). No database — a class
  needs only Node. The slides note "swap for MongoDB/Postgres in production";
  keep a `// PROD: swap JSON store for a real DB` comment in `store.js`.
- **Two packages:** `server/package.json` and `client/package.json` are separate,
  each with its own deps. They are independent processes.

## Target structure

```
taskflow-mcp/
├── CLAUDE.md
├── .env.example                 # ANTHROPIC_API_KEY=
├── .gitignore
├── data/                        # tasks.json created at runtime (gitignored)
├── server/
│   ├── package.json             # deps: @modelcontextprotocol/sdk, zod
│   ├── store.js                 # JSON-file task CRUD (the "database")
│   └── server.js                # McpServer: tools + resource + prompt, stdio
└── client/
    ├── package.json             # deps: @modelcontextprotocol/sdk, @anthropic-ai/sdk, dotenv
    ├── mcp-client.js            # connect to server, list tools, call tools, schema convert
    └── chat.js                  # REPL host: Claude tool-use loop  (entry point)
```

## Data model — a task

```js
{
  id: "t1",                 // short stable id (incrementing or random)
  title: "Finish MCP slides",
  priority: "high",          // "low" | "medium" | "high"   (default "medium")
  status: "pending",         // "pending" | "done"          (default "pending")
  due: "2026-06-28",         // optional ISO date string, or null
  createdAt: "2026-06-27T13:30:00.000Z"
}
```

## server/store.js — the contract (pure, no MCP imports)

A tiny module that owns `data/tasks.json`. Create the file/dir if missing.

- `listTasks(status = "all")` → array (filter by status when not "all")
- `addTask({ title, priority?, due? })` → the created task (assigns id + defaults)
- `getTask(id)` → task | undefined
- `updateTask(id, fields)` → updated task | null
- `completeTask(id)` → updated task | null   (sets status:"done")
- `deleteTask(id)` → boolean

## server/server.js — the contract

Build one `McpServer({ name: "taskflow", version: "1.0.0" })` and register:

**Tools** (each: name, clear description, zod input schema, async handler that
returns `{ content: [{ type: "text", text: ... }] }`):
- `add_task`      — `{ title, priority?, due? }`  → confirm with the new id
- `list_tasks`    — `{ status? }`                 → human-readable list (and ids)
- `complete_task` — `{ id }`                      → confirm or "not found"
- `update_task`   — `{ id, title?, priority?, due? }`
- `delete_task`   — `{ id }`

**Resource** (read-only data, app-controlled):
- `tasks://all` — returns the full tasks array as JSON text.

**Prompt** (reusable template, user-controlled):
- `daily_standup` — returns a message asking the model to summarise today's tasks
  into a short standup (yesterday/today/blockers).

Connect with `StdioServerTransport`. The server is launched **by the host**.

## client/mcp-client.js — the contract

- Create a `Client` and a `StdioClientTransport` that runs `node ../server/server.js`
  (resolve the path relative to this file). `await client.connect(transport)`.
- `getAnthropicTools()` → fetch `client.listTools()` and map each MCP tool to the
  Anthropic tools shape: `{ name, description, input_schema: tool.inputSchema }`.
- `runTool(name, args)` → `client.callTool({ name, arguments: args })`, return the
  text content as a string.
- `disconnect()` → close transport/client.

## client/chat.js — the contract (entry point)

1. Load `.env` (dotenv), create the Anthropic client (model `claude-sonnet-4-6`).
2. Connect the MCP client; fetch tools via `getAnthropicTools()`.
3. A `readline` REPL. Keep a `messages` array. On each user line:
   - call `anthropic.messages.create({ model, max_tokens, system, tools, messages })`
   - **loop while** `stop_reason === "tool_use"`: for each `tool_use` block, call
     `runTool(...)`, push a `tool_result` (user-role) message, call Claude again.
   - print the final text. Show a small `🔧 calling <tool>(...)` line when a tool
     runs, so students SEE the model deciding.
4. System prompt: "You are TaskFlow, a task assistant. Use the tools to read and
   change the user's tasks. Confirm what you did in one short sentence."
5. On `exit`/Ctrl-C: `disconnect()` and quit cleanly.

## MCP gotchas (call these out in class)

- **stdio = stdout is sacred.** The server speaks JSON-RPC over **stdout**. In
  `server/*.js` **never use `console.log`** — it corrupts the protocol. Use
  `console.error` (stderr) for any logging/debug.
- **Server is spawned by the host**, not run by hand, when using our client. To
  test the server *alone*, use the MCP Inspector (`npx @modelcontextprotocol/inspector`).
- **Tool descriptions are the API the model sees.** Vague description = wrong/missed
  tool calls. Write them like docs.
- **One embedding/auth key only:** the server needs no API key at all; only the
  client needs `ANTHROPIC_API_KEY`.

## Security rules (slides Section 6)

- **Validate every tool input with zod** before touching the store (treat tool
  args as untrusted — they come from the model).
- **Least privilege:** the store only ever reads/writes `data/tasks.json`. No
  shell, no fs outside that file.
- **No secrets in tool output.** Tools return task data only — never env vars.
- Destructive tool (`delete_task`) returns a clear confirmation; in production it
  would require a human approval step (mention this).

## Definition of done (what "working" looks like)

1. `npx @modelcontextprotocol/inspector node server/server.js` lists 5 tools, the
   `tasks://all` resource, and the `daily_standup` prompt; calling `add_task` works.
2. `node client/chat.js` connects, and this conversation works end-to-end:
   - "add a task to finish the MCP slides by tomorrow, high priority" → task added
   - "what's pending?" → shows it
   - "mark the slides task done" → completed
   - `data/tasks.json` reflects every change live.
3. The same server registered in Claude Desktop / Claude Code shows the tools and
   Claude can manage tasks there too — **no code changes**. (The M+N payoff.)

## Do NOT

- Do not put the Anthropic SDK or any API key in `server/`.
- Do not `console.log` in the server (use `console.error`).
- Do not add a database, web frontend, or auth — out of scope for Part 1.
- Do not generate all files at once; follow `docs/PROMPTS.md` step by step so
  students see each piece and we can demo after each.
