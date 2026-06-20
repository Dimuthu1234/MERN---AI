// server/services/ai.service.js
// ─────────────────────────────────────────────────────────────────────────────
// DocChat AI — the ONLY file that (will) import the Anthropic SDK.
// Model: claude-sonnet-4-6.
//
// Prompt 1 scope: chunkText only — pure JS, no AI call. Later prompts add
// searchChunks, summariseDocument, summariseConversation, and streamChat here.
// ─────────────────────────────────────────────────────────────────────────────

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
