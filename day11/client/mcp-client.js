// client/mcp-client.js — the CLIENT half of the host.
//
// This connects to our MCP server by SPAWNING it as a child process over stdio
// (StdioClientTransport runs `node ../server/server.js`). It knows nothing about
// Claude — it just lists/calls tools. chat.js (the host) wires this to Claude.

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
// Resolve the server entry relative to THIS file so it works from any cwd.
const SERVER_PATH = join(__dirname, "..", "server", "server.js");

const client = new Client({ name: "taskflow-client", version: "1.0.0" });
let transport;

// connect() — spawn the server over stdio and connect the client to it.
export async function connect() {
  transport = new StdioClientTransport({
    command: "node",
    args: [SERVER_PATH],
  });
  await client.connect(transport);
  return client;
}

// getAnthropicTools() — list the server's tools and map them to the Anthropic
// tool-use shape the Claude API expects.
export async function getAnthropicTools() {
  const { tools } = await client.listTools();
  return tools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    input_schema: tool.inputSchema,
  }));
}

// runTool(name, args) — call a tool and return its text content as a string.
export async function runTool(name, args) {
  const result = await client.callTool({ name, arguments: args });
  return (result.content ?? [])
    .filter((c) => c.type === "text")
    .map((c) => c.text)
    .join("\n");
}

// disconnect() — close the transport/client (also stops the spawned server).
export async function disconnect() {
  await client.close();
}

// --- self-test: `node mcp-client.js` -------------------------------------
// Connects, prints the tool names, disconnects. Proves running the client
// auto-starts the server (stdio spawn).
// (pathToFileURL handles paths with spaces — this folder is "MERN + AI".)
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await connect();
  const tools = await getAnthropicTools();
  console.log("Connected. Tools from the server:");
  for (const t of tools) console.log(` - ${t.name}`);
  await disconnect();
  process.exit(0);
}
