// =========================================================
// 01 — First Claude Call
// =========================================================
//
// The simplest possible Claude API call. Run:
//   node 01-first-claude-call.js
//
// What you'll see in the terminal:
//   - Claude's text response
//   - Token usage (input + output)
//   - Estimated cost in USD
//
// 🎯 Teaching points:
//   1. The SDK is `@anthropic-ai/sdk` — install via npm
//   2. `client.messages.create()` is THE main method
//   3. Required params: `model`, `max_tokens`, `messages[]`
//   4. Response shape: `.content[0].text`, `.usage.{input,output}_tokens`
//   5. EVERY call costs money — even tiny ones. Track tokens.
// =========================================================

require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk').default;

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('❌ ANTHROPIC_API_KEY missing — copy .env.example to .env and fill it');
  process.exit(1);
}

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// claude-sonnet-4-5 pricing (as of 2026):
//   $3 per million input tokens
//   $15 per million output tokens
const PRICE_INPUT_PER_MTOK  = 3;
const PRICE_OUTPUT_PER_MTOK = 15;

(async () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🤖  Calling Claude…');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const started = Date.now();

  const response = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5',
    max_tokens: 200,
    messages: [
      { role: 'user', content: 'Say hello in 2 sentences. Mention you are a coding assistant.' },
    ],
  });

  const elapsedMs = Date.now() - started;

  // The response has a `content` array — usually a single text block.
  const text = response.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('\n');

  const { input_tokens, output_tokens } = response.usage;
  const costUsd =
    (input_tokens  / 1_000_000) * PRICE_INPUT_PER_MTOK +
    (output_tokens / 1_000_000) * PRICE_OUTPUT_PER_MTOK;

  console.log('\n💬 Claude says:\n');
  console.log(text);
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`⏱  ${elapsedMs} ms`);
  console.log(`📥 input tokens : ${input_tokens}`);
  console.log(`📤 output tokens: ${output_tokens}`);
  console.log(`💰 cost: $${costUsd.toFixed(6)}  (${(costUsd * 100).toFixed(4)} ¢)`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
})().catch((err) => {
  console.error('❌ Claude call failed:', err.message);
  if (err.status === 401) console.error('   → Check your ANTHROPIC_API_KEY in .env');
  if (err.status === 429) console.error('   → Rate limited — wait a few seconds and retry');
  process.exit(1);
});
