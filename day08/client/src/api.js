// =========================================================
// API wrappers — Tasks CRUD (day 07) + AI endpoints (day 08)
// =========================================================

import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

const api = axios.create({ baseURL: BASE_URL });

// ─── Tasks CRUD (same as day 07) ───
export const TasksAPI = {
  list:   ()        => api.get('/tasks').then((r) => r.data),
  get:    (id)      => api.get(`/tasks/${id}`).then((r) => r.data),
  create: (data)    => api.post('/tasks', data).then((r) => r.data),
  update: (id, p)   => api.put(`/tasks/${id}`, p).then((r) => r.data),
  remove: (id)      => api.delete(`/tasks/${id}`).then((r) => r.data),
};

// ─── AI endpoints (new in day 08) ───
export const AI = {
  categorize: (title)   => api.post('/ai/categorize', { title }).then((r) => r.data),
  enhance:    (title)   => api.post('/ai/enhance',    { title }).then((r) => r.data),
  subtasks:   (taskId)  => api.post(`/ai/suggest-subtasks/${taskId}`).then((r) => r.data),
  usage:      ()        => api.get('/ai/usage').then((r) => r.data),
  /**
   * Streaming chat — uses fetch + ReadableStream because axios doesn't
   * stream cleanly in the browser. Calls `onChunk(text)` for each token,
   * resolves when the stream ends.
   */
  chat: async (prompt, onChunk) => {
    const res = await fetch(`${BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    if (!res.ok || !res.body) throw new Error('Stream init failed: ' + res.status);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // SSE events are split by `\n\n`. Each event may have multiple lines.
      const parts = buffer.split('\n\n');
      buffer = parts.pop() || '';
      for (const part of parts) {
        const dataLine = part.split('\n').find((l) => l.startsWith('data:'));
        if (!dataLine) continue;
        const json = dataLine.slice(5).trim();
        if (!json) continue;
        try {
          const obj = JSON.parse(json);
          if (obj.chunk) onChunk(obj.chunk);
        } catch { /* skip malformed */ }
      }
    }
  },
};
