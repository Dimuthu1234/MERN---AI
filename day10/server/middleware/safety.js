// server/middleware/safety.js
// ─────────────────────────────────────────────────────────────────────────────
// Section 6 (Slides 32–37): the always-on guardrails for /api/ai/*.
//   Layer 1: rate limit (abuse / cost control)
//   Layer 2: injection detection (refuse before calling Claude)
//   Layer 3: input/document wrapping  -> in ai.service.js
//   Layer 4: safe fallback on any LLM error -> in ai.routes.js
// ─────────────────────────────────────────────────────────────────────────────
import rateLimit from 'express-rate-limit';

// ── Layer 1 (Slide 34): 20 requests / minute, keyed by client IP ──────────────
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  handler: (_req, res) =>
    res.status(429).json({ success: false, error: 'Too many requests. Please slow down.' }),
});

// ── Layer 2 (Slide 32): prompt-injection detection ───────────────────────────
// Cheap regex pre-filter for the most common jailbreak phrasings. Not perfect —
// it's the first line of defense, paired with input wrapping (Layer 3).
const INJECTION_PATTERNS = [
  /ignore (all |previous )?instructions/i,
  /system prompt/i,
  /you are now/i,
  /pretend (you are|to be)/i,
  /disregard your/i,
];

export function detectInjection(text) {
  if (!text) return false;
  return INJECTION_PATTERNS.some((re) => re.test(text));
}
