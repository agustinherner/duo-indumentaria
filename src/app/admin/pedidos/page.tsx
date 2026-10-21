"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";

type Item = { id: string; name: string; quantity: number; size: string; price: number };
type Order = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  zip: string;
  notes: string;
  total: number;
  status: string;
  createdAt: string;
  items: Item[];
};

const statuses = [
  { value: "pending", label: "Pendiente" },
  { value: "paid", label: "Pagado" },
  { value: "shipped", label: "Enviado" },
  { value: "cancelled", label: "Cancelado" },
];

export default function AdminPedidos() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [open, setOpen] = useState<string | null>(null);

  async function load() {
    const d = await fetch("/api/admin/orders").then((r) => r.json());
    setOrders(d.orders || []);
  }
  useEffect(() => {
    load();
  }, []);

  async function setStatus(id: string, status: string) {
    await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">Pedidos</h1>
      <p className="mb-6 text-neutral-500">{orders.length} pedidos</p>

      {orders.length === 0 ? (
        <p className="rounded-xl border border-neutral-200 bg-white p-8 text-center text-neutral-500">
          Todavía no hay pedidos.
        </p>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="rounded-xl border border-neutral-200 bg-white">
              <button
                onClick={() => setOpen(open === o.id ? null : o.id)}
                className="flex w-full flex-wrap items-center justify-between gap-3 p-4 text-left"
              >
                <div>
                  <p className="font-semibold">
                    #{o.id.slice(-6).toUpperCase()} · {o.fullName}
                  </p>
                  <p className="text-xs text-neutral-400">
                    {new Date(o.createdAt).toLocaleString("es-AR")} · {o.email}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold">{formatPrice(o.total)}</span>
                  <select
                    value={o.status}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setStatus(o.id, e.target.value)}
                    className="rounded-md border border-neutral-300 px-2 py-1 text-sm"
                  >
                    {statuses.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </button>

              {open === o.id && (
                <div className="border-t border-neutral-100 p-4 text-sm">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <h3 className="mb-1 font-semibold">Productos</h3>
                      <ul className="space-y-1 text-neutral-600">
                        {o.items.map((it) => (
                          <li key={it.id}>
                            {it.name} × {it.quantity} {it.size && `(${it.size})`} —{" "}
                            {formatPrice(it.price * it.quantity)}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="mb-1 font-semibold">Envío / contacto</h3>
                      <p className="text-neutral-600">
                        {o.address}
                        {o.city && `, ${o.city}`}
                        {o.province && `, ${o.province}`}
                        {o.zip && ` (${o.zip})`}
                      </p>
                      {o.phone && <p className="text-neutral-600">Tel: {o.phone}</p>}
                      {o.notes && <p className="mt-1 text-neutral-500">Nota: {o.notes}</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
