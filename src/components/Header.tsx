"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";

type Category = { id: string; name: string; slug: string };
type Me = { id: string; name: string; role: string } | null;

export default function Header() {
  const { count, setOpen } = useCart();
  const [categories, setCategories] = useState<Category[]>([]);
  const [me, setMe] = useState<Me>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .catch(() => {});
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setMe(d.user || null))
      .catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-800 bg-ink/95 text-white backdrop-blur">
      <div className="container-page flex items-center justify-between gap-4 py-3">
        <button
          className="lg:hidden"
          aria-label="Menú"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <BurgerIcon />
        </button>

        <Link href="/" className="flex items-center">
          <span className="relative block h-9 w-[130px] sm:h-11 sm:w-[170px]">
            <Image src="/logo.jpeg" alt="Duo Indumentaria" fill className="object-contain" priority />
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium lg:flex">
          <Link href="/productos" className="hover:opacity-60">
            Todo
          </Link>
          {categories.slice(0, 6).map((c) => (
            <Link key={c.id} href={`/categoria/${c.slug}`} className="hover:opacity-60">
              {c.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href={me ? "/cuenta" : "/cuenta/login"}
            className="hidden text-sm hover:opacity-60 sm:block"
          >
            {me ? `Hola, ${me.name.split(" ")[0]}` : "Ingresar"}
          </Link>
          {me?.role === "admin" && (
            <Link href="/admin" className="hidden text-sm font-semibold hover:opacity-60 sm:block">
              Admin
            </Link>
          )}
          <button onClick={() => setOpen(true)} className="relative" aria-label="Carrito">
            <BagIcon />
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[11px] font-bold text-white">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-neutral-800 bg-ink lg:hidden">
          <nav className="container-page flex flex-col py-2">
            <Link href="/productos" className="py-2" onClick={() => setMenuOpen(false)}>
              Todo
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/categoria/${c.slug}`}
                className="py-2"
                onClick={() => setMenuOpen(false)}
              >
                {c.name}
              </Link>
            ))}
            <Link href={me ? "/cuenta" : "/cuenta/login"} className="py-2" onClick={() => setMenuOpen(false)}>
              {me ? "Mi cuenta" : "Ingresar"}
            </Link>
            {me?.role === "admin" && (
              <Link href="/admin" className="py-2 font-semibold" onClick={() => setMenuOpen(false)}>
                Panel Admin
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

function BagIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}
function BurgerIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}
