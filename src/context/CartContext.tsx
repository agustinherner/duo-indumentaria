"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  emoji: string;
  imageUrl: string;
  slug: string;
  size: string;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clear: () => void;
  count: number;
  total: number;
  isOpen: boolean;
  setOpen: (v: boolean) => void;
};

const CartContext = createContext<CartContextType | null>(null);
const STORAGE_KEY = "duo_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, loaded]);

  function addItem(item: Omit<CartItem, "quantity">, quantity = 1) {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.productId === item.productId && i.size === item.size);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + quantity };
        return next;
      }
      return [...prev, { ...item, quantity }];
    });
    setOpen(true);
  }

  function removeItem(productId: string, size: string) {
    setItems((prev) => prev.filter((i) => !(i.productId === productId && i.size === size)));
  }

  function updateQuantity(productId: string, size: string, quantity: number) {
    setItems((prev) =>
      prev
        .map((i) =>
          i.productId === productId && i.size === size ? { ...i, quantity: Math.max(1, quantity) } : i
        )
        .filter((i) => i.quantity > 0)
    );
  }

  function clear() {
    setItems([]);
  }

  const count = useMemo(() => items.reduce((n, i) => n + i.quantity, 0), [items]);
  const total = useMemo(() => items.reduce((n, i) => n + i.price * i.quantity, 0), [items]);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clear, count, total, isOpen, setOpen }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider");
  return ctx;
}
