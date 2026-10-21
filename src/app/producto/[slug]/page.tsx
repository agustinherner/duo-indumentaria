import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import AddToCartForm from "@/components/AddToCartForm";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function ProductoPage({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { category: true },
  });

  if (!product || !product.active) notFound();

  const related = await prisma.product.findMany({
    where: { active: true, categoryId: product.categoryId, id: { not: product.id } },
    include: { category: { select: { name: true } } },
    take: 4,
  });

  return (
    <div className="container-page py-10">
      <p className="mb-6 text-sm text-neutral-400">
        <Link href="/productos" className="hover:underline">
          Productos
        </Link>{" "}
        /{" "}
        <Link href={`/categoria/${product.category.slug}`} className="hover:underline">
          {product.category.name}
        </Link>{" "}
        / {product.name}
      </p>

      <div className="grid gap-10 md:grid-cols-2">
        <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-neutral-900">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-[10rem]">{product.emoji}</span>
          )}
        </div>

        <div>
          <p className="text-sm uppercase tracking-wide text-neutral-400">{product.category.name}</p>
          <h1 className="mt-1 text-3xl font-bold">{product.name}</h1>
          <p className="mt-3 text-2xl font-black">{formatPrice(product.price)}</p>
          <p className="mt-1 text-sm text-neutral-500">
            Hasta 6 cuotas con Mercado Pago
          </p>

          <div className="my-6 h-px bg-neutral-800" />

          <AddToCartForm
            product={{
              id: product.id,
              name: product.name,
              slug: product.slug,
              price: product.price,
              emoji: product.emoji,
              imageUrl: product.imageUrl,
              sizes: product.sizes,
              stock: product.stock,
            }}
          />

          {product.description && (
            <div className="mt-8">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide">Descripción</h3>
              <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-300">
                {product.description}
              </p>
            </div>
          )}

          <div className="mt-8 space-y-2 rounded-lg bg-neutral-900 p-4 text-sm text-neutral-300">
            <p>🚚 Envíos a todo el país.</p>
            <p>🏬 Retiro en local: 25 de Mayo 466, Santa Rosa (La Pampa).</p>
            <p>↩️ Cambios dentro de los 30 días.</p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-xl font-bold">También te puede gustar</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4">
            {related.map((p: (typeof related)[number]) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
