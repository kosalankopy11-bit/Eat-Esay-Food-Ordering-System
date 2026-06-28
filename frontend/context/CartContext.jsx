import { createContext, useContext, useEffect, useMemo, useState } from "react";

import api from "../services/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadCart = async () => {
    if (!user || user.role !== "customer") {
      setItems([]);
      return [];
    }
    setLoading(true);
    try {
      const { data } = await api.get("/cart");
      setItems(data);
      return data;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, [user?.id, user?.role]);

  const addToCart = async (foodId, quantity = 1) => {
    const { data } = await api.post("/cart", { food_id: foodId, quantity });
    await loadCart();
    return data;
  };

  const updateCartItem = async (cartId, quantity) => {
    if (quantity < 1) return;
    await api.put(`/cart/${cartId}`, { quantity });
    await loadCart();
  };

  const removeCartItem = async (cartId) => {
    await api.delete(`/cart/${cartId}`);
    await loadCart();
  };

  const clearLocalCart = () => setItems([]);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + Number(item.food.price) * item.quantity, 0);

  const value = useMemo(
    () => ({ items, loading, count, total, loadCart, addToCart, updateCartItem, removeCartItem, clearLocalCart }),
    [items, loading, count, total],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
}
