import { useState, useRef } from 'react';
import { CHAT_URL } from '../lib/api.js';

// useChat(docId) -> { messages, sendMessage, isStreaming }
// Section 1 (Slides 4–5): optimistic UI + token-by-token SSE streaming.
//
// message = { id, role: 'user' | 'assistant', content, status: 'done' | 'streaming' }
export function useChat(docId) {
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);

  // deltas land in a ref (fast, no re-render); a 50ms timer flushes to state so
  // React paints smoothly instead of once-per-token.
  const bufferRef = useRef('');

  async function sendMessage(text) {
    const content = text.trim();
    if (!content || !docId || isStreaming) return;

    // Optimistic UI (Slide 4): show the user message AND an empty assistant
    // bubble immediately — before the network round-trip.
    const userMsg = { id: crypto.randomUUID(), role: 'user', content, status: 'done' };
    const assistantId = crypto.randomUUID();
    const assistantMsg = { id: assistantId, role: 'assistant', content: '', status: 'streaming' };

    // history sent to the server (prior turns + this one), without UI fields.
    const outgoing = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setIsStreaming(true);
    bufferRef.current = '';

    // Flush accumulated deltas to the assistant bubble every 50ms.
    const flush = setInterval(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, content: bufferRef.current } : m)),
      );
    }, 50);

    try {
      const res = await fetch(CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docId, messages: outgoing }),
      });
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      // Read the SSE stream and parse `data:` lines (Slide 5).
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let carry = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        carry += decoder.decode(value, { stream: true });

        const lines = carry.split('\n');
        carry = lines.pop() ?? ''; // keep any partial line for the next chunk

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const payload = trimmed.slice(5).trim();
          if (payload === '[DONE]') continue;
          try {
            const { delta } = JSON.parse(payload);
            if (delta) bufferRef.current += delta;
          } catch {
            /* ignore keep-alive / malformed frames */
          }
        }
      }
    } catch (err) {
      console.error('[useChat] stream error:', err);
      if (!bufferRef.current) bufferRef.current = 'Something went wrong. Please try again.';
    } finally {
      clearInterval(flush);
      // Final flush + mark done so the typing indicator disappears.
      const finalText = bufferRef.current || '(no response)';
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, content: finalText, status: 'done' } : m,
        ),
      );
      setIsStreaming(false);
    }
  }

  return { messages, sendMessage, isStreaming };
}
