# TaskFlow MCP — Class Runbook (2 hours)

MCP Part 1 · MERN + AI Live Batch 2026. Instructor minute-by-minute plan.

## Before class (15 min)
- [ ] Create an empty `taskflow-mcp/` folder and copy `CLAUDE.md` into its root.
- [ ] Put `ANTHROPIC_API_KEY` in the root `.env` and verify the key works.
- [ ] Check Node version (`node -v` ≥ 18). Run `npx @modelcontextprotocol/inspector --help` once to warm the cache.
- [ ] Install Claude Desktop and know where `claude_desktop_config.json` lives.
- [ ] Open `~/Desktop/mcp-session1-guide.html` in a browser, and have an editor ready to show `data/tasks.json`.

## Part 1 — Theory (45 min)
Screen-share `~/Desktop/mcp-session1-guide.html`:
- **00:00–00:10** Section 1 — Why MCP? M×N → M+N, the USB-C analogy.
- **00:10–00:20** Section 2 — Host / Client / Server, JSON-RPC.
- **00:20–00:30** Section 3 — Tools vs Resources vs Prompts (who controls each).
- **00:30–00:38** Section 4 — stdio vs HTTP, lifecycle.
- **00:38–00:45** Section 5 + 6 quick — how to build a server + security. Ask one quiz.

> Bridge line: *"Now we'll build this exact diagram in code — a server, our own
> client/host, with Claude in the middle. Then we plug the same server into Claude
> Desktop too."*

## Part 2 — Live build (70 min)
Follow `docs/PROMPTS.md` in order. Demo after every prompt.

| Time        | Prompt | What happens            | Demo                                         |
|-------------|--------|-------------------------|----------------------------------------------|
| 00:45–00:55 | 0      | Scaffold + `store.js`   | node one-liner → `tasks.json` is created     |
| 00:55–01:05 | 1      | Server tools (5)        | (don't run) — explain the host spawns it     |
| 01:05–01:13 | 2      | Resource + Prompt       | **Inspector** — show tools/resource/prompt   |
| 01:13–01:22 | 3      | MCP client connector    | `node mcp-client.js` → tool names; auto-spawn|
| 01:22–01:38 | 4      | Claude tool-use loop    | **`node chat.js`** → add/list/complete LIVE 🎉|
| 01:38–01:48 | 5      | Claude Desktop/Code plug| same tasks in a second host (M+N)            |
| 01:48–01:55 | 6      | (bonus) `search_tasks`  | *"anything about zoom?"* → AI picks the tool |

## Part 3 — Wrap + Q&A (10 min)
- Recap: Host/Client/Server + Tools/Resources/Prompts + one server → many hosts.
- Production upgrades: JSON store → DB · stdio → HTTP+OAuth · validate inputs.
- **Next session (Part 2) teaser:** a remote HTTP server + auth, and wiring an MCP
  server into a real MERN backend (day12).

## Common errors + fixes
- **Client won't connect / JSON parse error** → there's a `console.log` in the
  server. Change all of them to `console.error`. (stdout = protocol channel.)
- **`Cannot find module` for the server path** → resolve the path in the client
  with `import.meta.url`, not a relative cwd.
- **401 / API key** → check `ANTHROPIC_API_KEY` in the root `.env` and that the
  client loads dotenv.
- **Inspector doesn't open** → manually open the localhost URL printed in the terminal.
- **A tool never gets called** → make the tool `description` clearer; the model
  decides based on it.
