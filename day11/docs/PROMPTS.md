# TaskFlow MCP — Claude Code Prompts (in order)

MCP Part 1 practical. Paste these prompts into Claude Code **in order**. After
each prompt, run the **Demo** (👉) before moving on.

> **Before you start:** create an empty `taskflow-mcp/` folder and copy this
> folder's `CLAUDE.md` into its root. Then `cd taskflow-mcp` and open `claude`
> (Claude Code) — it reads `CLAUDE.md` first.
>
> **Root `.env`:** `ANTHROPIC_API_KEY=sk-ant-...` (only the client needs it).

---

## 🔹 Prompt 0 — Scaffold + task store

```
Read CLAUDE.md fully — that is the spec. We build TaskFlow MCP step by step; do
ONLY this step.

Scaffold the project per the Target structure in CLAUDE.md:
- root: .env.example (ANTHROPIC_API_KEY=), reuse the existing .gitignore, a data/ dir
- server/package.json ("type":"module") with deps @modelcontextprotocol/sdk and zod
- client/package.json ("type":"module") with deps @modelcontextprotocol/sdk,
  @anthropic-ai/sdk, dotenv

Then implement server/store.js EXACTLY to the "store.js contract" in CLAUDE.md:
a pure JSON-file task store over data/tasks.json (create dir+file if missing),
with listTasks, addTask, getTask, updateTask, completeTask, deleteTask. Plain
ES modules, no MCP imports here. Add the `// PROD: swap JSON store for a real DB`
comment. Do not write server.js yet.
```

👉 **Demo:** show `cd server && npm i` installing. Then test the store with a
quick node one-liner:
`node -e "import('./store.js').then(s=>{s.addTask({title:'test'});console.log(s.listTasks())})"`
→ `data/tasks.json` is created with the task inside. Say: **"this is our database."**

---

## 🔹 Prompt 1 — MCP server: tools

```
Now create server/server.js per CLAUDE.md. Build one McpServer (name "taskflow",
version "1.0.0") using the official @modelcontextprotocol/sdk high-level API, and
register these 5 TOOLS, each with a clear description and a zod input schema, each
handler delegating to store.js and returning { content:[{type:"text",text:...}] }:

- add_task { title, priority?, due? }
- list_tasks { status? }            // "all" | "pending" | "done"
- complete_task { id }
- update_task { id, title?, priority?, due? }
- delete_task { id }

Connect with StdioServerTransport. CRITICAL: never console.log in this file —
stdout is the JSON-RPC channel; use console.error for any logging.
```

👉 **Demo:** don't run it yet — explain the server is something a *host* spawns.
We test it with the Inspector in the next step.

---

## 🔹 Prompt 2 — Resource + Prompt primitives

```
Add to server/server.js the other two MCP primitives from CLAUDE.md:

1. A RESOURCE `tasks://all` (read-only) that returns the full tasks array from
   store.js as JSON text. Add a comment that resources are app-controlled,
   read-only context (vs tools which take actions).
2. A PROMPT `daily_standup` (reusable template) that returns a user message asking
   the model to turn the current task list into a short standup
   (Done / Doing / Blockers). Keep it short.

Don't change the tools. Keep the no-console.log rule.
```

👉 **Demo (Checkpoint A — Inspector):**
```
npx @modelcontextprotocol/inspector node server/server.js
```
In the browser UI show: **5 tools**, the **`tasks://all` resource**, and the
**`daily_standup` prompt**. Call `add_task`, then read `tasks://all`. Say:
**"Claude is nowhere yet — this is pure protocol."**

---

## 🔹 Prompt 3 — MCP client connector (host side)

```
Now the host side. Create client/mcp-client.js per the "mcp-client.js contract"
in CLAUDE.md using the @modelcontextprotocol/sdk high-level Client + a
StdioClientTransport that launches `node ../server/server.js` (resolve the path
relative to this file with fileURLToPath/import.meta.url). Export:

- connect()            -> connects the client (spawns the server)
- getAnthropicTools()  -> client.listTools() mapped to Anthropic shape
                          { name, description, input_schema: tool.inputSchema }
- runTool(name, args)  -> client.callTool({name, arguments:args}); return text
- disconnect()

Add a tiny `node client/mcp-client.js` self-test under
`if (import.meta.url === ...)` that connects, prints the tool names, and exits.
```

👉 **Demo:** `cd client && npm i`, then `node mcp-client.js` → it prints the 5
tool names. Key point: running the client **auto-started the server** (stdio
spawn). Show the "Host → Client → Server" diagram again.

---

## 🔹 Prompt 4 — Claude tool-use loop (the magic)

```
Create client/chat.js per the "chat.js contract" in CLAUDE.md — this is the entry
point. Load .env, create the Anthropic client (model claude-sonnet-4-6), connect
the MCP client, fetch tools via getAnthropicTools(). Build a readline REPL with a
running messages array. On each user line: call anthropic.messages.create with the
tools, then LOOP while stop_reason === "tool_use": execute each tool_use block via
runTool, push a tool_result (user role) message, call Claude again; finally print
the assistant's text. Print a short `🔧 <tool>(<args>)` line whenever a tool runs.
Use the system prompt from CLAUDE.md. Clean disconnect on exit/Ctrl-C.
```

👉 **Demo (Checkpoint B — talk to it!):** `node client/chat.js`
Type these lines in order; show the `🔧` tool call each time:
1. `add a task to finish the MCP slides by tomorrow, high priority`
2. `add another: email the students the zoom link`
3. `what's still pending?`
4. `mark the slides task done`
5. `what's left?`

Keep `data/tasks.json` open in a side editor and show it **updating live**. 🎉
Say: **"the AI is actually calling our tool — that's MCP."**

---

## 🔹 Prompt 5 — Reuse the SAME server in Claude Desktop / Code (M+N payoff)

> No code here — just config. This proves the slides' Section 1 point:
> **one server, many hosts.**

**In Claude Code** (easiest):
```
claude mcp add taskflow -- node /ABSOLUTE/PATH/TO/taskflow-mcp/server/server.js
```
Then ask inside Claude Code: *"list my taskflow tasks"* / *"add a task: prep day12"*.

**Or in Claude Desktop** via `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "taskflow": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/taskflow-mcp/server/server.js"]
    }
  }
}
```
Save → **restart** Claude Desktop → the `taskflow` tools appear under the tools icon.

👉 **Demo:** show the same tasks added from our custom client showing up in Claude
Desktop / Code too. Say: **"we wrote no new code — two hosts, one server."**

---

## 🔹 Prompt 6 — (Bonus, if time) add a new tool live

```
Add one more tool to server/server.js: search_tasks { query } — returns tasks whose
title contains the query (case-insensitive). Same description + zod + content shape
as the others. Nothing else changes.
```

👉 **Demo:** restart the server, then ask in the client: *"do I have anything
about zoom?"* → Claude picks `search_tasks` on its own. Say: **"add a tool once,
every host gets it — that's M+N."**

---

## 🧯 Snippets / safety net

There are no `*-snippets/` here (today is a pure live build). If live generation
gets stuck: paste the error into Claude Code and say *"fix this, follow CLAUDE.md."*
Most common error: a `console.log` in the server → change it to `console.error`
(stdout corruption). Next: client path resolution (use `import.meta.url`), and
check `ANTHROPIC_API_KEY` is set in `.env`.
