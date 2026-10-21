"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";

export default function CarritoPage() {
  const { items, updateQuantity, removeItem, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="container-page py-20 text-center">
        <p className="text-5xl">🛒</p>
        <h1 className="mt-4 text-2xl font-bold">Tu carrito está vacío</h1>
        <Link href="/productos" className="btn-dark mt-6">
          Ver productos
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <h1 className="mb-8 text-3xl font-bold">Tu carrito</h1>
      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ul className="divide-y divide-neutral-800">
            {items.map((i) => (
              <li key={`${i.productId}-${i.size}`} className="flex gap-4 py-4">
                <div className="flex h-24 w-24 items-center justify-center rounded-md bg-neutral-900 text-4xl">
                  {i.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={i.imageUrl} alt={i.name} className="h-full w-full rounded-md object-cover" />
                  ) : (
                    i.emoji
                  )}
                </div>
                <div className="flex-1">
                  <Link href={`/producto/${i.slug}`} className="font-semibold hover:underline">
                    {i.name}
                  </Link>
                  <p className="text-sm text-neutral-500">Talle: {i.size}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      className="h-7 w-7 rounded border border-neutral-700"
                      onClick={() => updateQuantity(i.productId, i.size, i.quantity - 1)}
                    >
                      −
                    </button>
                    <span className="w-8 text-center">{i.quantity}</span>
                    <button
                      className="h-7 w-7 rounded border border-neutral-700"
                      onClick={() => updateQuantity(i.productId, i.size, i.quantity + 1)}
                    >
                      +
                    </button>
                    <button
                      className="ml-4 text-sm text-neutral-400 underline"
                      onClick={() => removeItem(i.productId, i.size)}
                    >
                      Quitar
                    </button>
                  </div>
                </div>
                <div className="font-semibold">{formatPrice(i.price * i.quantity)}</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="h-fit rounded-lg border border-neutral-800 p-6">
          <h2 className="mb-4 text-lg font-bold">Resumen</h2>
          <div className="flex justify-between py-1 text-sm">
            <span>Subtotal</span>
            <span>{formatPrice(total)}</span>
          </div>
          <div className="flex justify-between py-1 text-sm text-neutral-400">
            <span>Envío</span>
            <span>Se calcula en el checkout</span>
          </div>
          <div className="my-3 h-px bg-neutral-800" />
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
          <Link href="/checkout" className="btn-dark mt-6 w-full">
            Finalizar compra
          </Link>
        </div>
      </div>
    </div>
  );
}
