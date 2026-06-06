import ProductCard from "./ProductCard.jsx";

export default function ProductGrid({ products }) {
  if (!products?.length) {
    return (
      <div className="py-20 text-center text-slate-400">
        No products to show.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p._id} p={p} />
      ))}
    </div>
  );
}
