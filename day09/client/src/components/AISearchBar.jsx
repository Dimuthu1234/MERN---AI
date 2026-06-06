import { useState } from "react";
import { api } from "../lib/api.js";

// Calls POST /api/ai/search and hands ranked results up to the parent.
// `onResults(null)` resets to the full catalog (empty query).
export default function AISearchBar({ onResults }) {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  const search = async () => {
    const query = q.trim();
    if (!query) {
      onResults(null);
      return;
    }
    setLoading(true);
    try {
      const r = await api("/api/ai/search", {
        method: "POST",
        body: JSON.stringify({ query }),
      });
      onResults(r.data || []);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="flex gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm transition focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-400/40">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder="Describe what you want… e.g. something cozy for cold nights"
          className="flex-1 bg-transparent px-4 py-2.5 text-slate-800 outline-none placeholder:text-slate-400"
        />
        <button
          onClick={search}
          disabled={loading}
          className="rounded-xl bg-indigo-600 px-6 py-2.5 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Searching…" : "Search"}
        </button>
      </div>

      {loading && (
        <p className="mt-3 flex items-center justify-center gap-2 text-sm text-indigo-600">
          <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-500" />
          AI is finding matches…
        </p>
      )}
    </div>
  );
}
