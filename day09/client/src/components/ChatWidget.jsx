import { useState, useRef, useEffect } from "react";
import { useCart } from "../context/CartContext.jsx";
import { chatStreamUrl } from "../lib/api.js";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([]); // { role, content, added? }
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const { add } = useCart();
  const boxRef = useRef(null);

  // Keep the message list scrolled to the latest content.
  useEffect(() => {
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight });
  }, [msgs, open]);

  const send = async () => {
    if (!input.trim() || streaming) return;
    const userMsg = { role: "user", content: input };
    const history = [...msgs, userMsg];
    // Append the user turn + an empty assistant turn we'll stream into.
    setMsgs([...history, { role: "assistant", content: "", added: [] }]);
    setInput("");
    setStreaming(true);

    try {
      const res = await fetch(chatStreamUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Send only role/content — the server rebuilds its own system prompt.
        body: JSON.stringify({
          messages: history.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop();
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const evt = JSON.parse(line.slice(6));
          if (evt.type === "text") {
            setMsgs((m) => {
              const copy = [...m];
              copy[copy.length - 1].content += evt.text;
              return copy;
            });
          } else if (evt.type === "cart_add" && evt.product) {
            add(evt.product); // real product → cart badge + total update
            setMsgs((m) => {
              const copy = [...m];
              const last = copy[copy.length - 1];
              last.added = [...(last.added || []), evt.name];
              return copy;
            });
          } else if (evt.type === "error") {
            setMsgs((m) => {
              const copy = [...m];
              copy[copy.length - 1].content +=
                "\n⚠️ Sorry, the assistant is unavailable right now.";
              return copy;
            });
          }
        }
      }
    } catch {
      setMsgs((m) => {
        const copy = [...m];
        copy[copy.length - 1].content +=
          "\n⚠️ Sorry, something went wrong.";
        return copy;
      });
    } finally {
      setStreaming(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-30 grid h-14 w-14 place-items-center rounded-full bg-indigo-600 text-2xl text-white shadow-lg transition hover:scale-105 hover:bg-indigo-700"
        aria-label="Open shopping assistant"
      >
        {open ? "×" : "✦"}
      </button>

      <div
        className={`fixed bottom-24 right-6 z-30 flex h-[28rem] w-[22rem] flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl transition-all duration-300 ${
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        <div className="flex items-center gap-2 bg-indigo-600 px-4 py-3 font-semibold text-white">
          <span>✦</span> ShopWave AI Assistant
        </div>

        <div ref={boxRef} className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
          {msgs.length === 0 && (
            <p className="text-slate-400">
              Ask me anything — e.g. “a gift for my mom under 3000”.
            </p>
          )}
          {msgs.map((m, i) => (
            <div key={i} className={m.role === "user" ? "text-right" : ""}>
              <div
                className={`inline-block max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-left ${
                  m.role === "user"
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-800"
                }`}
              >
                {m.content || (m.role === "assistant" ? "…" : "")}
              </div>
              {m.added?.length > 0 && (
                <div className="mt-1 space-y-1">
                  {m.added.map((name, j) => (
                    <div
                      key={j}
                      className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                    >
                      ✓ Added “{name}” to cart
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 border-t border-slate-100 p-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Type a message…"
            className="flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-slate-400"
          />
          <button
            onClick={send}
            disabled={streaming}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {streaming ? "…" : "Send"}
          </button>
        </div>
      </div>
    </>
  );
}
