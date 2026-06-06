import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import AISearchBar from "../components/AISearchBar.jsx";
import ProductGrid from "../components/ProductGrid.jsx";

export default function Home() {
  const [all, setAll] = useState([]);
  const [results, setResults] = useState(null); // null = show full catalog
  const [loading, setLoading] = useState(true);

  // Load the full catalog once on mount.
  useEffect(() => {
    (async () => {
      const r = await api("/api/products");
      setAll(r.data || []);
      setLoading(false);
    })();
  }, []);

  const showingSearch = results !== null;
  const products = showingSearch ? results : all;

  return (
    <div className="space-y-10">
      <section className="space-y-5 pt-4 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          Find it by <span className="text-indigo-600">describing</span> it.
        </h1>
        <p className="mx-auto max-w-xl text-slate-500">
          Skip the filters. Tell ShopWave AI what you're after in plain words
          and let it rank the catalog for you.
        </p>
        <AISearchBar onResults={setResults} />
      </section>

      <section>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">
            {showingSearch ? "AI-ranked matches" : "All products"}
          </h2>
          {showingSearch && (
            <button
              onClick={() => setResults(null)}
              className="text-sm font-medium text-indigo-600 hover:underline"
            >
              Clear search
            </button>
          )}
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400">Loading…</div>
        ) : (
          <ProductGrid products={products} />
        )}
      </section>
    </div>
  );
}
