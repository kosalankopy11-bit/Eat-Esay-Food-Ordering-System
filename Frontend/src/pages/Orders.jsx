import { useEffect, useState } from "react";

import StatusBadge from "../components/StatusBadge";
import api from "../services/api";

export default function Orders() {
  const [orders, setOrders] = useState([]);

  const loadOrders = () => api.get("/orders").then(({ data }) => setOrders(data));

  useEffect(() => {
    loadOrders();
  }, []);

  const cancelOrder = async (order) => {
    await api.put(`/orders/${order.id}`, { status: "Cancelled" });
    loadOrders();
  };

  return (
    <section>
      <h1 className="text-3xl font-bold">Order history</h1>
      <div className="mt-6 space-y-4">
        {orders.map((order) => {
          const total = order.items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
          return (
            <article key={order.id} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-bold">Order #{order.id}</h2>
                  <p className="text-sm text-slate-500">{new Date(order.created_at).toLocaleString()}</p>
                </div>
                <StatusBadge status={order.status} />
              </div>
              <div className="mt-4 divide-y divide-slate-100">
                {order.items.map((item) => (
                  <div className="flex justify-between py-2 text-sm" key={item.id}>
                    <span>{item.food.name} x {item.quantity}</span>
                    <span>${(Number(item.price) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <strong>${total.toFixed(2)}</strong>
                {order.status === "Pending" && <button className="btn-danger" onClick={() => cancelOrder(order)} type="button">Cancel order</button>}
              </div>
            </article>
          );
        })}
        {orders.length === 0 && <p className="rounded-md border border-slate-200 bg-white p-6 text-slate-600">No orders yet.</p>}
      </div>
    </section>
  );
}
