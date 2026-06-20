import { useEffect, useRef, useState } from 'react';
import { useChat } from '../hooks/useChat.js';

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-0.5">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-blink-1" />
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-blink-2" />
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-blink-3" />
    </span>
  );
}

function Bubble({ message }) {
  const isUser = message.role === 'user';
  const isWaiting = message.status === 'streaming' && !message.content;

  return (
    <div className={`flex animate-fade-in-up ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={[
          'max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm',
          isUser
            ? 'rounded-br-md bg-indigo-600 text-white'
            : 'rounded-bl-md border border-slate-200 bg-white text-slate-800',
        ].join(' ')}
      >
        {isWaiting ? <TypingDots /> : message.content}
        {message.status === 'streaming' && message.content && (
          <span className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 animate-pulse bg-slate-400" />
        )}
      </div>
    </div>
  );
}

export default function ChatWidget({ docId, docTitle }) {
  const { messages, sendMessage, isStreaming } = useChat(docId);
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);

  // Auto-scroll to the latest message / token.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  function handleSend() {
    if (!input.trim() || isStreaming) return;
    sendMessage(input);
    setInput('');
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-sm font-semibold text-slate-800">Chat</h2>
        <p className="text-xs text-slate-400">
          {docTitle ? `Asking about “${docTitle}”` : 'Answers come only from your document'}
        </p>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-5 scroll-thin">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-slate-400">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-xl">
              💬
            </div>
            <p className="text-sm font-medium text-slate-500">Ask anything about your document</p>
            <p className="mt-1 text-xs">e.g. “Summarise the key points” or “What does it say about X?”</p>
          </div>
        ) : (
          messages.map((m) => <Bubble key={m.id} message={m} />)
        )}
      </div>

      <div className="border-t border-slate-100 p-4">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Ask a question…  (Enter to send)"
            className="max-h-32 flex-1 resize-none rounded-xl border border-slate-200 bg-white px-4 py-2.5
                       text-sm outline-none transition scroll-thin
                       focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm
                       transition hover:bg-indigo-700 active:scale-[0.99]
                       disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          >
            {isStreaming ? '…' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
