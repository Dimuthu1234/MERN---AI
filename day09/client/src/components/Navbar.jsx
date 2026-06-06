import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

export default function Navbar() {
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-lg text-white shadow-sm">
            ✦
          </span>
          <span className="text-lg font-extrabold tracking-tight">
            ShopWave<span className="text-indigo-600"> AI</span>
          </span>
        </Link>

        <nav className="flex items-center gap-3">
          <Link
            to="/admin"
            className="rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:text-indigo-600"
          >
            Admin
          </Link>
          <button
            className="relative rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-indigo-300 hover:text-indigo-600"
            aria-label="Cart"
          >
          Cart
          {count > 0 && (
            <span className="absolute -right-2 -top-2 grid h-6 min-w-6 place-items-center rounded-full bg-indigo-600 px-1.5 text-xs font-semibold text-white shadow">
              {count}
            </span>
          )}
          </button>
        </nav>
      </div>
    </header>
  );
}
