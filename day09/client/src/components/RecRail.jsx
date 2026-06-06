import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import { useCart } from "../context/CartContext.jsx";
import ProductCard from "./ProductCard.jsx";

// "You might also like" — AI-ranked complementary products for a given product.
export default function RecRail({ currentProductId }) {
  const { items } = useCart();
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const r = await api("/api/ai/recommend", {
        method: "POST",
        body: JSON.stringify({
          currentProductId,
          cartItemIds: items.map((i) => i._id),
        }),
      });
      if (!cancelled) {
        setRecs(r.data || []);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // Re-run when the product changes (cart changes shouldn't refetch the rail).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProductId]);

  if (loading) {
    return (
      <div className="py-10 text-center text-slate-400">
        Finding things that pair well…
      </div>
    );
  }

  if (!recs.length) return null;

  return (
    <section className="mt-16">
      <h2 className="mb-6 text-xl font-bold tracking-tight text-slate-900">
        You might also like
      </h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {recs.map((p) => (
          <ProductCard key={p._id} p={p} />
        ))}
      </div>
    </section>
  );
}
