// ─────────────────────────────────────────────────────────────────────────────
// frontend-reference.jsx — DocChat AI client safety net (combined).
// In the real repo, split into the files named in each banner. Tailwind classes
// assume Tailwind is set up. Section refs map to presentation-guide.html.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useRef, useCallback, useEffect } from 'react';

/* ===== src/lib/api.js ===== */
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const api = {
  ingest: (title, fullText) =>
    fetch(`${BASE}/api/docs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, fullText }),
    }).then((r) => r.json()),
  summarise: (docId) =>
    fetch(`${BASE}/api/ai/summarise`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ docId }),
    }).then((r) => r.json()),
  chatUrl: `${BASE}/api/ai/chat`,
};

/* ===== src/hooks/useChat.js =====  (Section 1, Slides 4–7) */
export function useChat(docId) {
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const accRef = useRef('');

  const sendMessage = useCallback(
    async (text) => {
      if (!text.trim() || !docId) return;

      // Optimistic UI (Slide 4): user msg done + empty assistant msg streaming
      const userMsg = { id: crypto.randomUUID(), role: 'user', content: text, status: 'done' };
      const assistantId = crypto.randomUUID();
      const assistantMsg = { id: assistantId, role: 'assistant', content: '', status: 'streaming' };
      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsStreaming(true);
      accRef.current = '';

      const history = [...messages, userMsg].map(({ role, content }) => ({ role, content }));

      // batch UI updates every 50ms instead of on every token (Slide 5)
      const flush = setInterval(() => {
        const snapshot = accRef.current;
        setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: snapshot } : m)));
      }, 50);

      try {
        const res = await fetch(api.chatUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ docId, messages: history }),
        });
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop(); // keep the partial line
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const payload = line.slice(6);
            if (payload === '[DONE]') continue;
            try {
              const { delta } = JSON.parse(payload);
              if (delta) accRef.current += delta;
            } catch {}
          }
        }
      } catch {
        accRef.current ||= 'Something went wrong. Please try again.';
      } finally {
        clearInterval(flush);
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: accRef.current, status: 'done' } : m)),
        );
        setIsStreaming(false);
      }
    },
    [messages, docId],
  );

  return { messages, sendMessage, isStreaming };
}

/* ===== src/components/UploadPanel.jsx =====  (Sections 3 + 4) */
export function UploadPanel({ onLoaded }) {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [info, setInfo] = useState(null);
  const [summary, setSummary] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setBusy(true);
    const r = await api.ingest(title, text);
    setBusy(false);
    if (r.success) {
      setInfo(r.data);
      onLoaded(r.data.id);
    }
  };
  const summarise = async () => {
    if (!info) return;
    setSummary({ loading: true });
    const r = await api.summarise(info.id);
    setSummary(r.success ? r.data : { error: true });
  };

  return (
    <div className="flex flex-col gap-3 p-5 bg-white rounded-2xl shadow-sm border border-slate-100">
      <h2 className="text-lg font-semibold text-slate-800">📄 Load a document</h2>
      <input
        className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
        placeholder="Title (optional)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="px-3 py-2 rounded-lg border border-slate-200 text-sm h-56 resize-none"
        placeholder="Paste your document text here…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        onClick={load}
        disabled={busy || !text.trim()}
        className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium disabled:opacity-40"
      >
        {busy ? 'Chunking…' : 'Load document'}
      </button>
      {info && (
        <div className="text-xs text-slate-500">
          ✓ Loaded · {info.chunkCount} chunks ·{' '}
          <button onClick={summarise} className="text-indigo-600 underline">
            Summarise
          </button>
        </div>
      )}
      {summary?.loading && <p className="text-xs text-slate-400">Summarising…</p>}
      {summary?.summary && (
        <div className="text-sm bg-slate-50 rounded-lg p-3">
          <p className="text-slate-700">{summary.summary}</p>
          <ul className="mt-2 list-disc pl-4 text-slate-500 text-xs">
            {summary.keyPoints?.map((k, i) => (
              <li key={i}>{k}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ===== src/components/ChatWidget.jsx =====  (Section 1) */
export function ChatWidget({ docId }) {
  const { messages, sendMessage, isStreaming } = useChat(docId);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  // auto-scroll after paint (Slide 4 tip: useLayoutEffect-style)
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const submit = (e) => {
    e.preventDefault();
    sendMessage(input);
    setInput('');
  };

  const waitingFirstToken =
    isStreaming && messages.at(-1)?.role === 'assistant' && !messages.at(-1)?.content;

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-100">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-slate-400 text-sm mt-10">
            Ask anything about your document…
          </p>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-sm'
                  : 'bg-slate-100 text-slate-800 rounded-bl-sm'
              }`}
            >
              {m.content}
              {m.status === 'streaming' && m.content && <span className="animate-pulse">▋</span>}
            </div>
          </div>
        ))}
        {waitingFirstToken && (
          <div className="flex gap-1 px-4">
            <Dot /> <Dot /> <Dot />
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={submit} className="p-3 border-t border-slate-100 flex gap-2">
        <input
          className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm"
          placeholder={docId ? 'Type a question…' : 'Load a document first'}
          value={input}
          disabled={!docId || isStreaming}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          disabled={!docId || isStreaming || !input.trim()}
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </div>
  );
}

const Dot = () => <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" />;

/* ===== src/App.jsx ===== */
export default function App() {
  const [docId, setDocId] = useState(null);
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <header className="max-w-5xl mx-auto mb-6">
        <h1 className="text-2xl font-bold text-slate-800">DocChat AI</h1>
        <p className="text-slate-500 text-sm">Chat with your document — streaming, grounded, safe.</p>
      </header>
      <main className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 h-[70vh]">
        <UploadPanel onLoaded={setDocId} />
        <ChatWidget docId={docId} />
      </main>
    </div>
  );
}
