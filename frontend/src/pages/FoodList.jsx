import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import api from "../services/api";

export default function FoodList() {
  const [foods, setFoods] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/foods").then(({ data }) => setFoods(data)).finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => [...new Set(foods.map((food) => food.category))], [foods]);
  const filteredFoods = foods.filter((food) => {
    const matchesSearch = food.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !category || food.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Order fresh meals</h1>
          <p className="mt-1 text-slate-600">Browse the menu, tune the category, and send dinner on its way.</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-[220px_180px]">
          <label className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input className="form-input pl-10" placeholder="Search food" value={search} onChange={(e) => setSearch(e.target.value)} />
          </label>
          <select className="form-input" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All categories</option>
            {categories.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <p className="mt-8 text-slate-600">Loading menu...</p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredFoods.map((food) => (
            <article key={food.id} className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
              <img className="h-44 w-full object-cover" src={food.image_url || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80"} alt={food.name} />
              <div className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-bold">{food.name}</h2>
                    <p className="text-sm text-slate-500">{food.category}</p>
                  </div>
                  <p className="font-bold text-tomato">${Number(food.price).toFixed(2)}</p>
                </div>
                <p className="line-clamp-2 text-sm text-slate-600">{food.description}</p>
                <Link className="btn-primary w-full" to={`/foods/${food.id}`}>View details</Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
