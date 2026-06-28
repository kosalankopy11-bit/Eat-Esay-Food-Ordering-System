import { Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useCart } from "../context/CartContext";
import api from "../services/api";

export default function Cart() {
  const navigate = useNavigate();
  const { items, loading, total, loadCart, updateCartItem, removeCartItem } = useCart();
  const [error, setError] = useState("");

  const updateQuantity = async (item, quantity) => {
    if (quantity < 1) return;
    try {
      await updateCartItem(item.id, quantity);
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to update cart item");
    }
  };

  const removeItem = async (id) => {
    try {
      await removeCartItem(id);
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to remove cart item");
    }
  };

  const placeOrder = async () => {
    setError("");
    try {
      await api.post("/orders");
      await loadCart();
      navigate("/orders");
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to place order");
    }
  };

  if (loading) return <p className="text-slate-600">Loading cart...</p>;

  return (
    <section>
      <h1 className="text-3xl font-bold">Your cart</h1>
      {error && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {items.length === 0 ? (
        <div className="mt-6 rounded-md border border-slate-200 bg-white p-6">
          <p className="text-slate-600">Your cart is empty.</p>
          <Link className="btn-primary mt-4" to="/">Browse menu</Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-3">
            {items.map((item) => (
              <article key={item.id} className="flex flex-col gap-4 rounded-md border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
                <img className="h-24 w-full rounded-md object-cover sm:w-28" src={item.food.image_url || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=500&q=80"} alt={item.food.name} />
                <div className="flex-1">
                  <h2 className="font-bold">{item.food.name}</h2>
                  <p className="text-sm text-slate-500">${Number(item.food.price).toFixed(2)} each</p>
                  <p className="mt-1 text-sm font-semibold">Line total: ${(Number(item.food.price) * item.quantity).toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="btn-secondary px-3" onClick={() => updateQuantity(item, item.quantity - 1)} type="button" aria-label="Decrease quantity"><Minus size={16} /></button>
                  <span className="w-8 text-center font-semibold">{item.quantity}</span>
                  <button className="btn-secondary px-3" onClick={() => updateQuantity(item, item.quantity + 1)} type="button" aria-label="Increase quantity"><Plus size={16} /></button>
                  <button className="btn-danger px-3" onClick={() => removeItem(item.id)} type="button" aria-label="Remove item"><Trash2 size={16} /></button>
                </div>
              </article>
            ))}
          </div>
          <aside className="h-fit rounded-md border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold">Order summary</h2>
            <div className="mt-4 flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <button className="btn-primary mt-5 w-full" onClick={placeOrder} type="button">Place order</button>
          </aside>
        </div>
      )}
    </section>
  );
}
