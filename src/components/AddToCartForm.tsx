"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  emoji: string;
  imageUrl: string;
  sizes: string;
  stock: number;
};

export default function AddToCartForm({ product }: { product: Product }) {
  const { addItem } = useCart();
  const sizes = product.sizes.split(",").map((s) => s.trim()).filter(Boolean);
  const [size, setSize] = useState(sizes[0] || "Único");
  const [qty, setQty] = useState(1);
  const outOfStock = product.stock <= 0;

  return (
    <div className="space-y-5">
      <div>
        <p className="label">Talle</p>
        <div className="flex flex-wrap gap-2">
          {sizes.map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={`min-w-11 rounded-md border px-4 py-2 text-sm font-medium transition ${
                size === s ? "border-white bg-white text-ink" : "border-neutral-700 hover:border-white"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center rounded-md border border-neutral-700">
          <button className="px-3 py-2" onClick={() => setQty((q) => Math.max(1, q - 1))}>
            −
          </button>
          <span className="w-10 text-center">{qty}</span>
          <button className="px-3 py-2" onClick={() => setQty((q) => Math.min(Math.max(product.stock, 1), q + 1))}>
            +
          </button>
        </div>
        <span className="text-sm text-neutral-400">
          {outOfStock ? "Sin stock" : `${product.stock} disponibles`}
        </span>
      </div>

      <button
        disabled={outOfStock}
        onClick={() =>
          addItem(
            {
              productId: product.id,
              name: product.name,
              price: product.price,
              emoji: product.emoji,
              imageUrl: product.imageUrl,
              slug: product.slug,
              size,
            },
            qty
          )
        }
        className="btn-dark w-full"
      >
        {outOfStock ? "Sin stock" : "Agregar al carrito"}
      </button>
    </div>
  );
}
