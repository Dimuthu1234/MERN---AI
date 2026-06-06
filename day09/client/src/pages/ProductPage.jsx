import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../lib/api.js";
import { useCart } from "../context/CartContext.jsx";

export default function ProductPage() {
  const { id } = useParams();
  const { add } = useCart();
  const [p, setP] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const r = await api(`/api/products/${id}`);
      setP(r.success ? r.data : null);
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return <div className="py-20 text-center text-slate-400">Loading…</div>;
  }

  if (!p) {
    return (
      <div className="py-20 text-center text-slate-500">
        <p>Product not found.</p>
        <Link to="/" className="mt-3 inline-block font-medium text-indigo-600 hover:underline">
          ← Back to shop
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/" className="inline-block text-sm font-medium text-indigo-600 hover:underline">
        ← Back to shop
      </Link>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
        </div>

        <div className="flex flex-col">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-500">
            {p.category}
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
            {p.name}
          </h1>
          <p className="mt-4 leading-relaxed text-slate-600">{p.description}</p>

          {p.tags?.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {p.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          <div className="mt-8 flex items-center gap-5">
            <span className="text-3xl font-bold tracking-tight">
              LKR {p.price.toLocaleString()}
            </span>
            <span
              className={`text-sm font-medium ${
                p.stock > 0 ? "text-emerald-600" : "text-rose-500"
              }`}
            >
              {p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}
            </span>
          </div>

          <button
            onClick={() => add(p)}
            disabled={p.stock <= 0}
            className="mt-6 rounded-2xl bg-indigo-600 px-8 py-3 font-medium text-white transition hover:bg-indigo-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}
