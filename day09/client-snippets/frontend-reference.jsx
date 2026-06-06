// ===== client/src/lib/api.js =====
const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
export async function api(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  return res.json();
}
export const chatStreamUrl = `${BASE}/api/ai/chat`;

// ===== client/src/context/CartContext.jsx =====
import { createContext, useContext, useState } from "react";
const CartContext = createContext();
export const useCart = () => useContext(CartContext);
export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const add = (p) => setItems((s) => [...s, p]);
  const remove = (id) => setItems((s) => s.filter((p) => p._id !== id));
  const clear = () => setItems([]);
  const total = items.reduce((sum, p) => sum + p.price, 0);
  return (
    <CartContext.Provider value={{ items, add, remove, clear, total, count: items.length }}>
      {children}
    </CartContext.Provider>
  );
}

// ===== client/src/components/AISearchBar.jsx =====
import { useState } from "react";
import { api } from "../lib/api";
export default function AISearchBar({ onResults }) {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const search = async () => {
    if (!q.trim()) return;
    setLoading(true);
    const r = await api("/api/ai/search", {
      method: "POST",
      body: JSON.stringify({ query: q }),
    });
    onResults(r.data || []);
    setLoading(false);
  };
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex gap-2 rounded-2xl border border-gray-200 bg-white p-2 shadow-sm focus-within:ring-2 focus-within:ring-indigo-400 transition">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder="Describe what you want… e.g. something cozy for cold nights"
          className="flex-1 px-3 py-2 outline-none bg-transparent"
        />
        <button
          onClick={search}
          disabled={loading}
          className="rounded-xl bg-indigo-600 px-5 py-2 text-white font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
        >
          {loading ? "AI searching…" : "Search"}
        </button>
      </div>
    </div>
  );
}

// ===== client/src/components/ProductCard.jsx =====
import { useCart } from "../context/CartContext";
export default function ProductCard({ p }) {
  const { add } = useCart();
  return (
    <div className="group rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden">
      <img src={p.image} alt={p.name} className="h-56 w-full object-cover" />
      <div className="p-4">
        <p className="text-xs uppercase tracking-wide text-indigo-500">{p.category}</p>
        <h3 className="font-semibold mt-1">{p.name}</h3>
        <p className="text-sm text-gray-500 line-clamp-2 mt-1">{p.description}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="font-bold">LKR {p.price.toLocaleString()}</span>
          <button
            onClick={() => add(p)}
            className="rounded-xl bg-gray-900 text-white text-sm px-4 py-2 hover:bg-indigo-600 transition"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== client/src/components/ChatWidget.jsx =====
import { useState, useRef } from "react";
import { useCart } from "../context/CartContext";
import { chatStreamUrl } from "../lib/api";
export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([]); // {role, content}
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const { add } = useCart();
  const boxRef = useRef(null);

  const send = async () => {
    if (!input.trim() || streaming) return;
    const userMsg = { role: "user", content: input };
    const history = [...msgs, userMsg];
    setMsgs([...history, { role: "assistant", content: "" }]);
    setInput("");
    setStreaming(true);

    const res = await fetch(chatStreamUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history }),
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
        } else if (evt.type === "cart_add") {
          // Optimistic: real app would fetch the product; demo shows confirmation.
          add({ _id: Math.random().toString(), name: evt.name, price: 0 });
        }
      }
    }
    setStreaming(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-indigo-600 text-white shadow-lg hover:scale-105 transition flex items-center justify-center text-2xl"
      >
        {open ? "×" : "✦"}
      </button>
      {open && (
        <div className="fixed bottom-24 right-6 w-80 h-96 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden">
          <div className="bg-indigo-600 text-white px-4 py-3 font-medium">
            ShopWave AI Assistant
          </div>
          <div ref={boxRef} className="flex-1 overflow-y-auto p-3 space-y-2 text-sm">
            {msgs.length === 0 && (
              <p className="text-gray-400">Ask me anything — e.g. "a gift for my mom under 3000"</p>
            )}
            {msgs.map((m, i) => (
              <div
                key={i}
                className={`rounded-xl px-3 py-2 max-w-[85%] ${
                  m.role === "user"
                    ? "bg-indigo-600 text-white ml-auto"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {m.content || "…"}
              </div>
            ))}
          </div>
          <div className="p-2 border-t flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Type a message…"
              className="flex-1 px-3 py-2 text-sm outline-none"
            />
            <button onClick={send} disabled={streaming} className="text-indigo-600 font-medium px-2">
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
