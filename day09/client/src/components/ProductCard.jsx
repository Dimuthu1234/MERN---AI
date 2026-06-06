import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

export default function ProductCard({ p }) {
  const { add } = useCart();

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link to={`/product/${p._id}`} className="block overflow-hidden">
        <img
          src={p.image}
          alt={p.name}
          className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-500">
          {p.category}
        </p>
        <Link to={`/product/${p._id}`}>
          <h3 className="mt-1 font-semibold text-slate-900 transition hover:text-indigo-600">
            {p.name}
          </h3>
        </Link>
        <p className="mt-1 line-clamp-2 text-sm text-slate-500">
          {p.description}
        </p>

        <div className="mt-4 flex items-center justify-between pt-1">
          <span className="text-lg font-bold tracking-tight">
            LKR {p.price.toLocaleString()}
          </span>
          <button
            onClick={() => add(p)}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-600 active:scale-95"
          >
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}
