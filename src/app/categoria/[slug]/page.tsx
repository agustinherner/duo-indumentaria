import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function CategoriaPage({ params }: { params: { slug: string } }) {
  const [category, categories] = await Promise.all([
    prisma.category.findUnique({
      where: { slug: params.slug },
      include: {
        products: {
          where: { active: true },
          include: { category: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    prisma.category.findMany({ orderBy: { order: "asc" } }),
  ]);

  if (!category) notFound();

  return (
    <div className="container-page py-10">
      <div className="mb-8">
        <p className="text-sm text-neutral-400">
          <Link href="/productos" className="hover:underline">
            Productos
          </Link>{" "}
          / {category.name}
        </p>
        <h1 className="mt-1 text-3xl font-bold">
          {category.emoji} {category.name}
        </h1>
        <p className="text-neutral-400">{category.products.length} productos</p>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <Link href="/productos" className="rounded-full border border-neutral-700 px-4 py-1.5 text-sm hover:border-white">
          Todo
        </Link>
        {categories.map((c: (typeof categories)[number]) => (
          <Link
            key={c.id}
            href={`/categoria/${c.slug}`}
            className={`rounded-full border px-4 py-1.5 text-sm ${
              c.slug === category.slug ? "border-white bg-white text-ink" : "border-neutral-700 hover:border-white"
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {category.products.length === 0 ? (
        <p className="py-20 text-center text-neutral-400">Todavía no hay productos en esta categoría.</p>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {category.products.map((p: (typeof category.products)[number]) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
