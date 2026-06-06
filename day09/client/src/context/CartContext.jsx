import { createContext, useContext, useState } from "react";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const add = (p) => setItems((s) => [...s, p]);
  const remove = (id) => setItems((s) => s.filter((p) => p._id !== id));
  const clear = () => setItems([]);
  const total = items.reduce((sum, p) => sum + (p.price || 0), 0);

  return (
    <CartContext.Provider
      value={{ items, add, remove, clear, total, count: items.length }}
    >
      {children}
    </CartContext.Provider>
  );
}
