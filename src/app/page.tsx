import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, featured, latest] = await Promise.all([
    prisma.category.findMany({ orderBy: { order: "asc" } }),
    prisma.product.findMany({
      where: { active: true, featured: true },
      include: { category: { select: { name: true } } },
      take: 8,
    }),
    prisma.product.findMany({
      where: { active: true },
      include: { category: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  const showcase = featured.length > 0 ? featured : latest;

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-ink text-white">
        <div className="container-page grid items-center gap-8 py-20 md:grid-cols-2 md:py-28">
          <div>
            <p className="mb-3 text-sm uppercase tracking-[0.3em] text-neutral-400">Nueva temporada</p>
            <h1 className="text-5xl font-black leading-none tracking-tight sm:text-6xl md:text-7xl">
              DUO
              <br />
              INDUMENTARIA
            </h1>
            <p className="mt-6 max-w-md text-neutral-300">
              Buzos, remeras, camperas, jeans y más. Estilo urbano con envíos a todo el país.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/productos" className="btn bg-white text-ink hover:bg-neutral-200">
                Ver colección
              </Link>
              <Link href="/categoria/buzos" className="btn border border-white text-white hover:bg-white hover:text-ink">
                Buzos
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {categories.slice(0, 6).map((c: (typeof categories)[number]) => (
              <Link
                key={c.id}
                href={`/categoria/${c.slug}`}
                className="flex aspect-square flex-col items-center justify-center rounded-xl bg-white/5 text-center transition hover:bg-white/10"
              >
                <span className="text-4xl">{c.emoji}</span>
                <span className="mt-2 text-xs font-semibold uppercase tracking-wide">{c.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORÍAS */}
      <section className="container-page py-14">
        <h2 className="mb-6 text-2xl font-bold">Categorías</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {categories.map((c: (typeof categories)[number]) => (
            <Link
              key={c.id}
              href={`/categoria/${c.slug}`}
              className="flex flex-col items-center gap-2 rounded-lg border border-neutral-800 p-4 text-center transition hover:border-white"
            >
              <span className="text-3xl">{c.emoji}</span>
              <span className="text-xs font-semibold">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* DESTACADOS */}
      <section className="container-page py-6">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-bold">{featured.length > 0 ? "Destacados" : "Novedades"}</h2>
          <Link href="/productos" className="text-sm underline">
            Ver todo
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {showcase.map((p: (typeof showcase)[number]) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* BANDA DE BENEFICIOS */}
      <section className="border-y border-neutral-800 bg-neutral-950">
        <div className="container-page grid gap-6 py-10 text-center md:grid-cols-3">
          <div>
            <p className="text-2xl">🚚</p>
            <h3 className="mt-2 font-semibold">Envíos a todo el país</h3>
            <p className="text-sm text-neutral-400">Por correo o retirá en el local.</p>
          </div>
          <div>
            <p className="text-2xl">💳</p>
            <h3 className="mt-2 font-semibold">Pagá en cuotas</h3>
            <p className="text-sm text-neutral-400">Con Mercado Pago, tarjeta o efectivo.</p>
          </div>
          <div>
            <p className="text-2xl">🏬</p>
            <h3 className="mt-2 font-semibold">Local en Santa Rosa</h3>
            <p className="text-sm text-neutral-400">25 de Mayo 466, La Pampa.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
