// client/chat.js — the HOST. Entry point for TaskFlow.
//
// This is where the LLM lives. It connects the MCP client (which spawns the
// server), fetches the server's tools, and runs Claude's tool-use loop: Claude
// decides to call a tool → we run it via the MCP client → we feed the result
// back → Claude answers. The server never sees Claude; the host wires them.

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import readline from "node:readline";
import dotenv from "dotenv";
import Anthropic from "@anthropic-ai/sdk";

import { connect, getAnthropicTools, runTool, disconnect } from "./mcp-client.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
// .env lives at the repo root; only the host (this file) needs the API key.
dotenv.config({ path: join(__dirname, "..", ".env") });

const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 1024;
const SYSTEM =
  "You are TaskFlow, a task assistant. Use the tools to read and change the " +
  "user's tasks. Confirm what you did in one short sentence.";

if (!process.env.ANTHROPIC_API_KEY) {
  console.error("Missing ANTHROPIC_API_KEY — add it to the repo-root .env.");
  process.exit(1);
}

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Collect the assistant's text blocks into one string.
const textOf = (content) =>
  content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");

async function main() {
  await connect();
  const tools = await getAnthropicTools();
  console.log(`TaskFlow ready (${tools.length} tools). Type a request, or "exit".\n`);

  const messages = [];

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "you ▸ ",
  });

  // Clean shutdown shared by exit and Ctrl-C.
  async function shutdown() {
    rl.close();
    await disconnect();
    process.exit(0);
  }

  // Handle one user line: run the Claude tool-use loop to completion.
  async function handleLine(line) {
    messages.push({ role: "user", content: line });

    let response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM,
      tools,
      messages,
    });

    // LOOP while Claude wants to call a tool.
    while (response.stop_reason === "tool_use") {
      // Record the assistant's turn (text + tool_use blocks) verbatim.
      messages.push({ role: "assistant", content: response.content });

      const toolResults = [];
      for (const block of response.content) {
        if (block.type !== "tool_use") continue;
        // Show students the model DECIDING to call our tool.
        console.log(`🔧 ${block.name}(${JSON.stringify(block.input)})`);
        const result = await runTool(block.name, block.input);
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: result,
        });
      }

      // Tool results go back as a USER-role message.
      messages.push({ role: "user", content: toolResults });

      response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: SYSTEM,
        tools,
        messages,
      });
    }

    // Final assistant turn: record it and print the text.
    messages.push({ role: "assistant", content: response.content });
    console.log(`\nTaskFlow ▸ ${textOf(response.content)}\n`);
  }

  rl.prompt();
  rl.on("line", async (line) => {
    const input = line.trim();
    if (!input) return rl.prompt();
    if (input === "exit" || input === "quit") return shutdown();
    try {
      await handleLine(input);
    } catch (err) {
      console.error("Error:", err.message);
    }
    rl.prompt();
  });

  // Ctrl-C / Ctrl-D → clean disconnect.
  rl.on("SIGINT", shutdown);
  rl.on("close", () => {});
}

main().catch(async (err) => {
  console.error(err);
  await disconnect().catch(() => {});
  process.exit(1);
});
