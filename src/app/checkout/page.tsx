"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";

const provincias = [
  "La Pampa", "Buenos Aires", "CABA", "Catamarca", "Chaco", "Chubut", "Córdoba",
  "Corrientes", "Entre Ríos", "Formosa", "Jujuy", "Mendoza", "Misiones", "Neuquén",
  "Río Negro", "Salta", "San Juan", "San Luis", "Santa Cruz", "Santa Fe",
  "Santiago del Estero", "Tierra del Fuego", "Tucumán",
];

export default function CheckoutPage() {
  const { items, total, clear } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    province: "La Pampa",
    zip: "",
    notes: "",
    delivery: "envio", // "envio" | "retiro"
  });

  function update(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, size: i.size, quantity: i.quantity })),
          customer: {
            fullName: form.fullName,
            email: form.email,
            phone: form.phone,
            address: form.delivery === "retiro" ? "Retira en local" : form.address,
            city: form.delivery === "retiro" ? "Santa Rosa" : form.city,
            province: form.province,
            zip: form.zip,
            notes: `${form.delivery === "retiro" ? "[RETIRO EN LOCAL] " : ""}${form.notes}`,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo procesar el pedido.");
        setLoading(false);
        return;
      }
      clear();
      window.location.href = data.redirectUrl;
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="text-2xl font-bold">Tu carrito está vacío</h1>
        <Link href="/productos" className="btn-dark mt-6">
          Ver productos
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <h1 className="mb-8 text-3xl font-bold">Finalizar compra</h1>
      <form onSubmit={submit} className="grid gap-10 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <fieldset>
            <legend className="mb-3 text-lg font-bold">Método de entrega</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <label
                className={`cursor-pointer rounded-lg border p-4 ${
                  form.delivery === "envio" ? "border-white ring-1 ring-white" : "border-neutral-700"
                }`}
              >
                <input
                  type="radio"
                  name="delivery"
                  className="mr-2"
                  checked={form.delivery === "envio"}
                  onChange={() => update("delivery", "envio")}
                />
                <b>Envío a domicilio</b>
                <p className="mt-1 text-sm text-neutral-400">A todo el país por correo.</p>
              </label>
              <label
                className={`cursor-pointer rounded-lg border p-4 ${
                  form.delivery === "retiro" ? "border-white ring-1 ring-white" : "border-neutral-700"
                }`}
              >
                <input
                  type="radio"
                  name="delivery"
                  className="mr-2"
                  checked={form.delivery === "retiro"}
                  onChange={() => update("delivery", "retiro")}
                />
                <b>Retiro en local</b>
                <p className="mt-1 text-sm text-neutral-400">25 de Mayo 466, Santa Rosa.</p>
              </label>
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-3 text-lg font-bold">Tus datos</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label">Nombre y apellido</label>
                <input className="input" required value={form.fullName} onChange={(e) => update("fullName", e.target.value)} />
              </div>
              <div>
                <label className="label">Email</label>
                <input className="input" type="email" required value={form.email} onChange={(e) => update("email", e.target.value)} />
              </div>
              <div>
                <label className="label">Teléfono</label>
                <input className="input" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
              </div>
            </div>
          </fieldset>

          {form.delivery === "envio" && (
            <fieldset>
              <legend className="mb-3 text-lg font-bold">Dirección de envío</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="label">Dirección (calle y número)</label>
                  <input className="input" required value={form.address} onChange={(e) => update("address", e.target.value)} />
                </div>
                <div>
                  <label className="label">Ciudad / Localidad</label>
                  <input className="input" required value={form.city} onChange={(e) => update("city", e.target.value)} />
                </div>
                <div>
                  <label className="label">Provincia</label>
                  <select className="input" value={form.province} onChange={(e) => update("province", e.target.value)}>
                    {provincias.map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Código postal</label>
                  <input className="input" value={form.zip} onChange={(e) => update("zip", e.target.value)} />
                </div>
              </div>
            </fieldset>
          )}

          <div>
            <label className="label">Notas del pedido (opcional)</label>
            <textarea className="input" rows={3} value={form.notes} onChange={(e) => update("notes", e.target.value)} />
          </div>
        </div>

        <div className="h-fit rounded-lg border border-neutral-800 p-6">
          <h2 className="mb-4 text-lg font-bold">Tu pedido</h2>
          <ul className="mb-4 space-y-3">
            {items.map((i) => (
              <li key={`${i.productId}-${i.size}`} className="flex justify-between gap-2 text-sm">
                <span>
                  {i.emoji} {i.name} <span className="text-neutral-400">×{i.quantity}</span>
                  <br />
                  <span className="text-xs text-neutral-400">Talle {i.size}</span>
                </span>
                <span className="whitespace-nowrap font-medium">{formatPrice(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="my-3 h-px bg-neutral-800" />
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="btn-dark mt-6 w-full">
            {loading ? "Procesando..." : "Ir a pagar"}
          </button>
          <p className="mt-3 text-center text-xs text-neutral-400">
            Pago seguro con Mercado Pago. El costo de envío se coordina luego según tu localidad.
          </p>
        </div>
      </form>
    </div>
  );
}
