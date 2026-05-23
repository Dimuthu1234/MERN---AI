// =========================================================
// 02 — System Prompts vs User Messages
// =========================================================
//
// The SAME user question, asked with TWO different system prompts,
// produces dramatically different answers.
//
// Run: node 02-system-and-user-prompts.js
//
// 🎯 Teaching points:
//   1. `system` = persona / rules / context that always applies
//   2. `messages[]` = the conversation (user + assistant turns)
//   3. Multi-turn = include past assistant replies in messages[]
//   4. Live demo: edit the system prompts below, re-run, watch the voice change
// =========================================================

require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk').default;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5';

const USER_QUESTION = 'What is JavaScript closure?';

const PERSONAS = {
  professor: {
    system:
      'You are a strict computer science professor. ' +
      'Answer in formal academic language. Use precise terminology. Maximum 60 words.',
  },
  friend: {
    system:
      'You are a chill software-engineer friend explaining something over coffee. ' +
      'Use casual language and a relatable analogy. Maximum 60 words.',
  },
  fiveYearOld: {
    system:
      'You are explaining concepts to a 5-year-old. ' +
      'Use no jargon. Use a simple, concrete analogy a child would understand. Maximum 60 words.',
  },
};

async function ask(label, personaConfig) {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 200,
    temperature: 0.7,
    system: personaConfig.system,
    messages: [{ role: 'user', content: USER_QUESTION }],
  });

  const text = response.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('\n');

  console.log(`\n━━━━━ ${label.toUpperCase()} ━━━━━`);
  console.log(text);
  console.log(`  (tokens: ${response.usage.input_tokens} in, ${response.usage.output_tokens} out)`);
}

(async () => {
  console.log(`\n🎯 Question (same for all three):\n   "${USER_QUESTION}"\n`);

  for (const [label, persona] of Object.entries(PERSONAS)) {
    await ask(label, persona);
  }

  // -------------------------------------------------
  // BONUS — multi-turn conversation
  // -------------------------------------------------
  // To keep context across turns, include past assistant replies
  // back in the messages[] array.
  console.log('\n\n━━━━━ MULTI-TURN CONVERSATION ━━━━━');

  const messages = [
    { role: 'user', content: 'I am building a Tasks API in Node.js. What is one feature I should add?' },
  ];

  // Turn 1
  let r = await client.messages.create({
    model: MODEL,
    max_tokens: 150,
    system: 'You are a senior backend engineer giving short, actionable advice.',
    messages,
  });
  const assistantReply1 = r.content[0].text;
  console.log('🤖 Turn 1:', assistantReply1);

  // Add the assistant's reply + a follow-up question to the same array
  messages.push({ role: 'assistant', content: assistantReply1 });
  messages.push({ role: 'user', content: 'Show me a 5-line example of that in Express.' });

  // Turn 2 — Claude sees the full context
  r = await client.messages.create({
    model: MODEL,
    max_tokens: 200,
    system: 'You are a senior backend engineer giving short, actionable advice.',
    messages,
  });
  console.log('\n🤖 Turn 2:', r.content[0].text);
})().catch((e) => {
  console.error('❌', e.message);
  process.exit(1);
});
