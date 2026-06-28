import { CheckCircle2, Clock, ShoppingBag, Users } from "lucide-react";
import { useEffect, useState } from "react";

import api from "../services/api";

const cards = [
  ["total_users", "Total users", Users, "text-blue-700"],
  ["total_orders", "Total orders", ShoppingBag, "text-tomato"],
  ["pending_orders", "Pending orders", Clock, "text-amber-700"],
  ["delivered_orders", "Delivered orders", CheckCircle2, "text-emerald-700"],
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/dashboard").then(({ data }) => setStats(data));
  }, []);

  return (
    <section>
      <h1 className="text-3xl font-bold">Admin dashboard</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([key, label, Icon, color]) => (
          <article className="rounded-md border border-slate-200 bg-white p-5 shadow-sm" key={key}>
            <Icon className={color} size={24} />
            <p className="mt-4 text-sm text-slate-500">{label}</p>
            <strong className="text-3xl">{stats ? stats[key] : "..."}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}
