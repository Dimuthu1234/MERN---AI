import { useState } from "react";
import { api } from "../lib/api.js";

const CATEGORIES = ["Apparel", "Home", "Electronics", "Accessories"];

export default function Admin() {
  const [form, setForm] = useState({
    name: "",
    category: "Apparel",
    description: "",
    tags: "",
    marketingCopy: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const generate = async () => {
    if (!form.name.trim()) {
      setError("Enter a product name first.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const r = await api("/api/ai/generate-content", {
        method: "POST",
        body: JSON.stringify({ name: form.name, category: form.category }),
      });
      if (r.success) {
        setForm((f) => ({
          ...f,
          description: r.data.description || "",
          tags: (r.data.seoTags || []).join(", "),
          marketingCopy: r.data.marketingCopy || "",
        }));
      } else {
        setError(r.error || "Generation failed.");
      }
    } catch {
      setError("Generation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
        Admin · New Product
      </h1>
      <p className="mt-2 text-slate-500">
        Enter a name and category, then let AI draft the copy for you.
      </p>

      <div className="mt-8 space-y-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Product name">
            <input
              value={form.name}
              onChange={set("name")}
              placeholder="e.g. Linen Summer Shirt"
              className="input"
            />
          </Field>
          <Field label="Category">
            <select value={form.category} onChange={set("category")} className="input">
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
        </div>

        <button
          onClick={generate}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
        >
          <span>✦</span>
          {loading ? "Generating…" : "Generate with AI"}
        </button>
        {error && <p className="text-sm text-rose-500">{error}</p>}

        <Field label="Description">
          <textarea
            value={form.description}
            onChange={set("description")}
            rows={3}
            placeholder="AI-generated product description…"
            className="input resize-none"
          />
        </Field>

        <Field label="SEO tags (comma-separated)">
          <input
            value={form.tags}
            onChange={set("tags")}
            placeholder="tag1, tag2, tag3…"
            className="input"
          />
        </Field>

        <Field label="Marketing copy">
          <input
            value={form.marketingCopy}
            onChange={set("marketingCopy")}
            placeholder="A punchy one-liner…"
            className="input"
          />
        </Field>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}
