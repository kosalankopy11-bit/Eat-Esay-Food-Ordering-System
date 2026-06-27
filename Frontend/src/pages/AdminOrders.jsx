import { useEffect, useState } from "react";

import StatusBadge from "../components/StatusBadge";
import api from "../services/api";

const statuses = ["Pending", "Preparing", "Delivered", "Cancelled"];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);

  const loadOrders = () => api.get("/orders").then(({ data }) => setOrders(data));

  useEffect(() => {
    loadOrders();
  }, []);

  const updateStatus = async (orderId, status) => {
    await api.put(`/orders/${orderId}`, { status });
    loadOrders();
  };

  return (
    <section>
      <h1 className="text-3xl font-bold">All orders</h1>
      <div className="mt-6 overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => {
                const total = order.items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
                return (
                  <tr key={order.id}>
                    <td className="px-4 py-3">
                      <strong>#{order.id}</strong>
                      <p className="text-xs text-slate-500">{new Date(order.created_at).toLocaleString()}</p>
                    </td>
                    <td className="px-4 py-3">
                      {order.items.map((item) => <p key={item.id}>{item.food.name} x {item.quantity}</p>)}
                    </td>
                    <td className="px-4 py-3 font-semibold">${total.toFixed(2)}</td>
                    <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                    <td className="px-4 py-3">
                      <select className="form-input min-w-36" value={order.status} onChange={(e) => updateStatus(order.id, e.target.value)}>
                        {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
