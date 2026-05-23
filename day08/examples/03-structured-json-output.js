// =========================================================
// 03 — Structured JSON Output ⭐ MOST IMPORTANT
// =========================================================
//
// LLMs naturally output prose. For programs, we need JSON we can
// `JSON.parse()`. This example demonstrates THE pattern that
// powers every "AI feature" inside a backend:
//
//   1. Ask Claude in plain English what JSON you want
//   2. Include the exact schema
//   3. Add "Output strict JSON. No markdown. No commentary."
//   4. Parse defensively (Claude sometimes wraps in ```json fences)
//
// Run: node 03-structured-json-output.js
// =========================================================

require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk').default;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5';

// -------------------------------------------------
// The system prompt INSISTS on JSON + provides a schema
// -------------------------------------------------
const SYSTEM_PROMPT = `You categorize task titles for a to-do app.

Given a task title, return:
  - priority: one of "low" | "medium" | "high"
  - tags: 2 to 4 short lowercase keywords describing the task

Examples:
  Input: "fix the login bug crashing prod"
  Output: { "priority": "high", "tags": ["bug", "auth", "production"] }

  Input: "buy milk"
  Output: { "priority": "low", "tags": ["shopping", "personal"] }

OUTPUT RULES:
- Strict JSON only. No markdown. No commentary outside the JSON.
- Tags are lowercase, single-word or hyphenated, no spaces.

Schema:
{
  "priority": "low|medium|high",
  "tags": ["string", "string", ...]
}`;

// -------------------------------------------------
// Defensive JSON extractor — production-grade
// -------------------------------------------------
function extractJson(text) {
  // 1. If Claude wrapped in ```json ... ```, strip it
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const candidate = fenceMatch ? fenceMatch[1] : text;

  // 2. Find first { or [ (Claude sometimes adds a leading sentence)
  const objStart = candidate.indexOf('{');
  const arrStart = candidate.indexOf('[');
  let from;
  if (objStart === -1) from = arrStart;
  else if (arrStart === -1) from = objStart;
  else from = Math.min(objStart, arrStart);

  if (from === -1) throw new Error('No JSON found in response: ' + text);

  // 3. Parse the slice from { onwards
  return JSON.parse(candidate.slice(from));
}

// -------------------------------------------------
// Try several task titles to see consistency
// -------------------------------------------------
const TITLES = [
  'fix the production database crash from last night',
  'water the plants',
  'prepare slide deck for monday client demo',
  'refactor auth middleware to use jwt',
  'call mom',
];

(async () => {
  for (const title of TITLES) {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 200,
      temperature: 0.2,         // ↓ temperature → more consistent JSON
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: `Task title: "${title}"\n\nReturn the JSON.` }],
    });

    const rawText = response.content[0].text;

    let parsed;
    try {
      parsed = extractJson(rawText);
    } catch (e) {
      console.log(`\n❌ "${title}"`);
      console.log('   Failed to parse Claude response:', rawText);
      continue;
    }

    console.log(`\n✅ "${title}"`);
    console.log('   →', JSON.stringify(parsed));
    console.log(`   (tokens: ${response.usage.input_tokens}/${response.usage.output_tokens})`);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('💡 Notice:');
  console.log('   - Lower temperature (0.2) makes JSON more deterministic');
  console.log('   - Including 2 example input/output pairs in the prompt helps consistency');
  console.log('   - `extractJson()` survives both raw JSON AND markdown-fenced JSON');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
})().catch((e) => {
  console.error('❌', e.message);
  process.exit(1);
});
