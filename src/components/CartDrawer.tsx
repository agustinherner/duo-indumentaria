"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";

export default function CartDrawer() {
  const { items, isOpen, setOpen, removeItem, updateQuantity, total, count } = useCart();

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-black/50 transition-opacity ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setOpen(false)}
      />
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-ink text-white shadow-xl transition-transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-neutral-800 p-4">
          <h2 className="text-lg font-bold">Tu carrito ({count})</h2>
          <button onClick={() => setOpen(false)} aria-label="Cerrar" className="text-2xl leading-none">
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="mt-20 text-center text-neutral-400">
              <p className="text-4xl">🛒</p>
              <p className="mt-4">Tu carrito está vacío</p>
              <button onClick={() => setOpen(false)} className="btn-dark mt-6">
                Ver productos
              </button>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((i) => (
                <li key={`${i.productId}-${i.size}`} className="flex gap-3 border-b border-neutral-800 pb-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-md bg-neutral-900 text-4xl">
                    {i.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={i.imageUrl} alt={i.name} className="h-full w-full rounded-md object-cover" />
                    ) : (
                      i.emoji
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{i.name}</p>
                    <p className="text-xs text-neutral-500">Talle: {i.size}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        className="h-6 w-6 rounded border border-neutral-700"
                        onClick={() => updateQuantity(i.productId, i.size, i.quantity - 1)}
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm">{i.quantity}</span>
                      <button
                        className="h-6 w-6 rounded border border-neutral-700"
                        onClick={() => updateQuantity(i.productId, i.size, i.quantity + 1)}
                      >
                        +
                      </button>
                      <button
                        className="ml-auto text-xs text-neutral-400 underline"
                        onClick={() => removeItem(i.productId, i.size)}
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                  <div className="text-sm font-semibold">{formatPrice(i.price * i.quantity)}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-neutral-800 p-4">
            <div className="mb-4 flex items-center justify-between text-lg font-bold">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
            <Link href="/checkout" onClick={() => setOpen(false)} className="btn-dark w-full">
              Finalizar compra
            </Link>
            <p className="mt-2 text-center text-xs text-neutral-400">Envíos a todo el país</p>
          </div>
        )}
      </aside>
    </>
  );
}
