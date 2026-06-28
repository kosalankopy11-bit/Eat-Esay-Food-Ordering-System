import { ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useCart } from "../context/CartContext";
import api from "../services/api";

export default function FoodDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [food, setFood] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    api.get(`/foods/${id}`).then(({ data }) => setFood(data));
  }, [id]);

  const handleAddToCart = async () => {
    setMessage("");
    setError("");
    setAdding(true);
    try {
      await addToCart(Number(id), quantity);
      setMessage("Added to cart");
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to add this item to cart");
    } finally {
      setAdding(false);
    }
  };

  if (!food) return <p className="text-slate-600">Loading food item...</p>;

  return (
    <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <img className="min-h-[320px] w-full rounded-md object-cover" src={food.image_url || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1100&q=80"} alt={food.name} />
      <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-tomato">{food.category}</p>
        <h1 className="mt-2 text-3xl font-bold">{food.name}</h1>
        <p className="mt-4 text-slate-600">{food.description}</p>
        <p className="mt-5 text-2xl font-bold text-tomato">${Number(food.price).toFixed(2)}</p>
        {message && <p className="mt-4 rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}
        {error && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <div className="mt-6 flex items-center gap-3">
          <input className="form-input max-w-28" min="1" type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
          <button className="btn-primary" disabled={!food.availability || adding} onClick={handleAddToCart} type="button">
            <ShoppingCart size={18} />
            {adding ? "Adding..." : "Add to cart"}
          </button>
          {message && <button className="btn-secondary" onClick={() => navigate("/cart")} type="button">View cart</button>}
        </div>
      </div>
    </section>
  );
}
