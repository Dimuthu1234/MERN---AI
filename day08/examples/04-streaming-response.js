// =========================================================
// 04 — Streaming Response (Token by token)
// =========================================================
//
// Instead of waiting 5-15 seconds for the full response, stream
// it as Claude generates each token. This is how ChatGPT-style
// "typing" effect works.
//
// Run: node 04-streaming-response.js
//
// 🎯 Teaching points:
//   1. `messages.stream()` instead of `messages.create()`
//   2. Returns an EventEmitter — handle .on('text'), .on('end'), .on('error')
//   3. .finalMessage() at end gives you the full assembled response + usage
//   4. Frontend → backend: backend sends Server-Sent Events (SSE) to browser
// =========================================================

require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk').default;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5';

(async () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🤖 Streaming Claude response…');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const started = Date.now();
  let firstTokenAt = null;
  let tokenCount = 0;

  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 400,
    system: 'You are a helpful Node.js mentor. Be concise.',
    messages: [
      {
        role: 'user',
        content:
          'Explain what npm is to a beginner. ' +
          'Then give a 3-step "first npm install" walkthrough. ' +
          'Total response under 150 words.',
      },
    ],
  });

  // Fires for each text chunk as it arrives
  stream.on('text', (chunk) => {
    if (firstTokenAt === null) firstTokenAt = Date.now();
    tokenCount++;
    process.stdout.write(chunk);
  });

  // Optional — fires when message is complete
  stream.on('end', () => {
    console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Stream complete`);
  });

  // Catch streaming errors
  stream.on('error', (err) => {
    console.error('\n❌ Stream error:', err.message);
  });

  // Wait for the full message — gives us usage stats
  const finalMessage = await stream.finalMessage();

  const totalMs       = Date.now() - started;
  const firstTokenMs  = firstTokenAt - started;
  const { input_tokens, output_tokens } = finalMessage.usage;

  console.log(`⏱  First token after ${firstTokenMs} ms`);
  console.log(`⏱  Full response in   ${totalMs} ms`);
  console.log(`📊 Chunks received: ${tokenCount}`);
  console.log(`📥 input tokens : ${input_tokens}`);
  console.log(`📤 output tokens: ${output_tokens}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('💡 The user sees text appearing as it generates instead of');
  console.log('   waiting 5-15 seconds for the full response. Much better UX.');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
})().catch((e) => {
  console.error('❌', e.message);
  process.exit(1);
});
