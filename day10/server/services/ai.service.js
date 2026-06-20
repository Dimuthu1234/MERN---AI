// server/services/ai.service.js
// ─────────────────────────────────────────────────────────────────────────────
// DocChat AI — the ONLY file that imports the Anthropic SDK.
// Model: claude-sonnet-4-6.
//
// Exposes: chunkText, searchChunks, summariseDocument.
// (streamChat + summariseConversation arrive in later prompts.)
// ─────────────────────────────────────────────────────────────────────────────
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = 'claude-sonnet-4-6';

// ── Section 3 (Slide 15): chunking — pure JS, no AI call ──────────────────────
// Split text into ~400-word chunks with a 40-word overlap so context isn't lost
// at chunk boundaries. Each chunk is { index, text }.
export function chunkText(text, chunkWords = 400, overlap = 40) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const chunks = [];
  let start = 0;
  while (start < words.length) {
    const end = Math.min(start + chunkWords, words.length);
    chunks.push({ index: chunks.length, text: words.slice(start, end).join(' ') });
    if (end === words.length) break;
    start += chunkWords - overlap; // step forward, keeping `overlap` words of context
  }
  return chunks;
}

// ── Section 3 (Slide 18): retrieval — lexical keyword-overlap scorer ──────────
// Score each chunk by how many of the query's terms it shares, normalised by
// chunk length so long chunks don't always win. Return the top-K, highest first.
// PROD: swap for text-embedding-3-small + cosine similarity (see slides 16–18).
export function searchChunks(chunks, query, topK = 4) {
  const qTerms = new Set(query.toLowerCase().match(/\w+/g) || []);
  return chunks
    .map((c) => {
      const cTerms = c.text.toLowerCase().match(/\w+/g) || [];
      let shared = 0;
      for (const t of cTerms) if (qTerms.has(t)) shared++;
      return { ...c, score: shared / Math.sqrt(cTerms.length || 1) };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .filter((c) => c.score > 0);
}

// ── Section 4 (Slide 22): structured JSON output, parsed safely ───────────────
// Ask Claude for ONLY a JSON object; parse defensively (strip code fences,
// slice to the outer braces) so a stray token never crashes the route.
export async function summariseDocument(fullText) {
  const msg = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 600,
    system:
      'You are a precise summariser. Return ONLY a JSON object with keys: ' +
      '"summary" (string, max 60 words) and "keyPoints" (string[], max 5 items). ' +
      'No prose, no markdown, no code fences.',
    messages: [
      { role: 'user', content: `Summarise this document:\n\n${fullText.slice(0, 12000)}` },
    ],
  });
  const raw = msg.content.find((b) => b.type === 'text')?.text ?? '{}';
  return safeJson(raw, { summary: 'Could not summarise the document.', keyPoints: [] });
}

// ── helper: strip code fences / stray text, then JSON.parse with a fallback ────
// The "Zod-style safe parse" idea (Slide 22): never trust the model's text blindly.
function safeJson(raw, fallback) {
  try {
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return fallback;
  }
}
