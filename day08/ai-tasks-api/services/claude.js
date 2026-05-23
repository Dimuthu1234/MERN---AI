// =========================================================
// services/claude.js — Anthropic Claude wrapper
//
// ALL Claude calls in this app go through this file. Why?
//   1. Single SDK client (re-used across requests)
//   2. Consistent error + retry handling
//   3. Cost tracking (essential — Claude calls cost real money)
//   4. Daily cap → refuses calls if today's spend exceeds the limit
//   5. `extractJson` helper for the JSON-output pattern
//
// In production walata `usageLog` eka DB ekata save karagannan one.
// Class walata in-memory daily counter eka enough for the demo.
// =========================================================

const Anthropic = require('@anthropic-ai/sdk').default;

if (!process.env.ANTHROPIC_API_KEY) {
  console.warn('⚠️  ANTHROPIC_API_KEY not set — /ai/* endpoints will fail');
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Pricing table (USD per 1M tokens) ───
const PRICING = {
  'claude-sonnet-4-5': { input: 3,   output: 15  },
  'claude-opus-4-5':   { input: 15,  output: 75  },
  'claude-haiku-4-5':  { input: 0.8, output: 4   },
};

function priceFor(model) {
  if (PRICING[model]) return PRICING[model];
  for (const k of Object.keys(PRICING)) if (model.startsWith(k)) return PRICING[k];
  return { input: 3, output: 15 }; // default = sonnet
}

// ─── In-memory daily spend tracker ───
// Production: persist to Mongo / Redis instead of memory.
const dailySpend = {
  date: new Date().toISOString().slice(0, 10),
  usd: 0,
  calls: 0,
};

function rolloverIfNewDay() {
  const today = new Date().toISOString().slice(0, 10);
  if (today !== dailySpend.date) {
    dailySpend.date = today;
    dailySpend.usd = 0;
    dailySpend.calls = 0;
  }
}

function getDailySpend() {
  rolloverIfNewDay();
  return { ...dailySpend };
}

// ─── Cost cap guard ───
class DailyCostCapError extends Error {
  constructor(spentUsd, capUsd) {
    super(`Daily AI cost cap reached: $${spentUsd.toFixed(4)} >= $${capUsd.toFixed(2)}`);
    this.name = 'DailyCostCapError';
    this.status = 429;
  }
}

function assertCostCap() {
  rolloverIfNewDay();
  const cap = Number(process.env.DAILY_COST_CAP_USD || 1);
  if (dailySpend.usd >= cap) throw new DailyCostCapError(dailySpend.usd, cap);
}

// ─── Main wrapper ───
async function callClaude({ system, user, maxTokens = 800, temperature = 0.7, model }) {
  assertCostCap();

  const useModel = model || process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5';
  const started = Date.now();

  const response = await client.messages.create({
    model: useModel,
    max_tokens: maxTokens,
    temperature,
    system,
    messages: [{ role: 'user', content: user }],
  });

  const text = response.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('\n');

  const { input_tokens, output_tokens } = response.usage;
  const p = priceFor(useModel);
  const costUsd =
    (input_tokens  / 1_000_000) * p.input +
    (output_tokens / 1_000_000) * p.output;

  dailySpend.usd += costUsd;
  dailySpend.calls += 1;

  const durationMs = Date.now() - started;

  console.log(
    `🤖 Claude  ${useModel}  ${input_tokens}/${output_tokens} tok  ` +
    `$${costUsd.toFixed(6)}  ${durationMs}ms  ` +
    `(daily $${dailySpend.usd.toFixed(6)})`
  );

  return { text, inputTokens: input_tokens, outputTokens: output_tokens, costUsd, durationMs, model: useModel };
}

// ─── Streaming wrapper (for /ai/chat) ───
function streamClaude({ system, user, maxTokens = 800, temperature = 0.7, model }) {
  assertCostCap();
  const useModel = model || process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5';

  const stream = client.messages.stream({
    model: useModel,
    max_tokens: maxTokens,
    temperature,
    system,
    messages: [{ role: 'user', content: user }],
  });

  // When the stream finishes, log the cost so we still track it.
  stream.finalMessage().then((m) => {
    const p = priceFor(useModel);
    const costUsd =
      (m.usage.input_tokens  / 1_000_000) * p.input +
      (m.usage.output_tokens / 1_000_000) * p.output;
    dailySpend.usd += costUsd;
    dailySpend.calls += 1;
    console.log(
      `🤖 Claude(stream) ${useModel}  ${m.usage.input_tokens}/${m.usage.output_tokens} tok  ` +
      `$${costUsd.toFixed(6)}  (daily $${dailySpend.usd.toFixed(6)})`
    );
  }).catch(() => {});

  return stream;
}

// ─── Defensive JSON extractor (see examples/03) ───
function extractJson(text) {
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const candidate = fence ? fence[1] : text;

  const o = candidate.indexOf('{');
  const a = candidate.indexOf('[');
  let from;
  if (o === -1) from = a;
  else if (a === -1) from = o;
  else from = Math.min(o, a);

  if (from === -1) throw new Error('No JSON found in Claude response');
  return JSON.parse(candidate.slice(from));
}

module.exports = {
  callClaude,
  streamClaude,
  extractJson,
  getDailySpend,
  DailyCostCapError,
};
