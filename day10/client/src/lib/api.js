// client/src/lib/api.js — all server calls in one place.
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5050';

export const CHAT_URL = `${BASE}/api/ai/chat`;

// POST /api/docs -> { id, chunkCount }
export async function ingestDocument({ title, fullText }) {
  const res = await fetch(`${BASE}/api/docs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, fullText }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Could not load document');
  return json.data;
}

// POST /api/ai/summarise -> { summary, keyPoints[] }
export async function summariseDocument(docId) {
  const res = await fetch(`${BASE}/api/ai/summarise`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ docId }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Could not summarise');
  return json.data;
}
