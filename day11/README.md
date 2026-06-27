# Day 11 — TaskFlow MCP · Session: Model Context Protocol (MCP) Part 1

AcademyDSJ · MERN + AI Live Batch 2026. This folder has everything needed to run
today's class — built **live with Claude Code** (TaskFlow MCP).

This package is **not a finished repo** — like day10, Claude Code generates the
system **live** from the prompts. `CLAUDE.md` is the context-engineering file;
`docs/PROMPTS.md` is the sequence of prompts you paste in class.

> The Sinhala **presentation guide** lives on the Desktop as
> `mcp-session1-guide.html` (open it in a browser for the theory part) — it is
> intentionally kept out of this folder.

## What's inside

```
day11/
├── CLAUDE.md                 # ⭐ project context — Claude Code reads this to build
├── .env.example              # ANTHROPIC_API_KEY (client/host only)
├── .gitignore
└── docs/
    ├── PROMPTS.md            # ⭐ prompts to paste into Claude Code (Prompt 0 → 6)
    └── RUNBOOK.md            # 2-hour minute-by-minute plan + common errors
```

## TaskFlow MCP — what is it?

An AI task manager you talk to in plain language. Say *"add a task to finish the
MCP slides by tomorrow, high priority"* and the AI actually calls a real tool that
writes to your task list. This one practical exercises all **three MCP roles**
end to end:

- **Server** (`server/`) — task tools (`add_task`, `list_tasks`, `complete_task`…)
  + a `tasks://all` resource + a `daily_standup` prompt → stored in `data/tasks.json`.
- **Host + Client** (`client/`) — our own app: an MCP client connects to the
  server and runs the Claude (Anthropic API) tool-use loop.
- **Second host** — the **same server** is then registered in Claude Desktop /
  Claude Code (**no new code**) → this proves the **M+N reuse** point from the
  slides (Section 1).

## How to use

1. **Before class:** read `docs/RUNBOOK.md` and do the pre-class setup. Create an
   empty `taskflow-mcp/` folder and copy `CLAUDE.md` + `.gitignore` into it. Put
   `ANTHROPIC_API_KEY` in a root `.env`.
2. **Part 1 (theory):** screen-share `~/Desktop/mcp-session1-guide.html` and walk
   through all six sections.
3. **Part 2 (build):** paste `docs/PROMPTS.md` Prompt 0 → 6 into Claude Code in
   order. Demo after each prompt.

## Requirements

- Node v18+ (20+ preferred), `npm i -g @anthropic-ai/claude-code`
- An Anthropic API key (`.env` → `ANTHROPIC_API_KEY`)
- Claude Desktop (for the Prompt 5 reuse demo) — optional
- Model: **`claude-sonnet-4-6`**

## Deps installed live
```bash
# server/  — needs NO API key
npm i @modelcontextprotocol/sdk zod
# client/  — the host + Claude
npm i @modelcontextprotocol/sdk @anthropic-ai/sdk dotenv
```

> **Golden rule:** with the stdio transport, **never `console.log` in the server** —
> stdout is the JSON-RPC channel. Use `console.error` (stderr) for any logging.
