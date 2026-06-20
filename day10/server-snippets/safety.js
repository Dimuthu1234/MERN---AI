// server/middleware/safety.js
// ─────────────────────────────────────────────────────────────────────────────
// Section 6 (Slides 32–37): guardrails for the AI endpoints.
//   - aiRateLimiter : per-IP rate limit (abuse + runaway cost protection)
//   - detectInjection : cheap synchronous regex gate, runs BEFORE any LLM call
// ─────────────────────────────────────────────────────────────────────────────
import rateLimit from 'express-rate-limit';

// Slide 34: rate limit AI endpoints (20 requests / minute / user|ip)
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  keyGenerator: (req) => req.user?.id || req.ip,
  handler: (_req, res) =>
    res.status(429).json({
      success: false,
      error: 'Too many requests. Please wait a moment before sending another message.',
    }),
});

// Slide 32 + 36: known prompt-injection trigger phrases. Regex is free and
// synchronous, so it runs first and gates the slower async checks.
const INJECTION_PATTERNS = [
  /ignore (all |previous )?instructions/i,
  /system prompt/i,
  /you are now/i,
  /disregard your/i,
  /pretend (you are|to be)/i,
  /reveal your (prompt|instructions)/i,
];

export function detectInjection(text = '') {
  return INJECTION_PATTERNS.some((re) => re.test(text));
}
