// Thin fetch wrapper. Base URL comes from env so the same client works against
// local and deployed backends. All responses follow { success, data, error }.
const BASE = import.meta.env.VITE_API_URL || "http://localhost:5557";

export async function api(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  return res.json();
}

// Streaming chat endpoint (wired up by a later block).
export const chatStreamUrl = `${BASE}/api/ai/chat`;
