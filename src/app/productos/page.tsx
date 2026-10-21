import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = searchParams.q?.trim();
  const [categories, products] = await Promise.all([
    prisma.category.findMany({ orderBy: { order: "asc" } }),
    prisma.product.findMany({
      where: { active: true, ...(q ? { name: { contains: q } } : {}) },
      include: { category: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="container-page py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Todos los productos</h1>
        <p className="text-neutral-400">{products.length} productos</p>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <Link href="/productos" className="rounded-full border border-white bg-white px-4 py-1.5 text-sm text-ink">
          Todo
        </Link>
        {categories.map((c: (typeof categories)[number]) => (
          <Link
            key={c.id}
            href={`/categoria/${c.slug}`}
            className="rounded-full border border-neutral-700 px-4 py-1.5 text-sm hover:border-white"
          >
            {c.emoji} {c.name}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <p className="py-20 text-center text-neutral-400">No se encontraron productos.</p>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p: (typeof products)[number]) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
