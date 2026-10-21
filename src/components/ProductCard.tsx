import Link from "next/link";
import { formatPrice } from "@/lib/utils";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  emoji: string;
  imageUrl: string;
  category?: { name: string };
};

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/producto/${product.slug}`} className="group block">
      <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden rounded-lg bg-neutral-900 transition group-hover:bg-neutral-800">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="text-7xl transition duration-300 group-hover:scale-110">{product.emoji}</span>
        )}
      </div>
      <div className="mt-3">
        {product.category?.name && (
          <p className="text-[11px] uppercase tracking-wide text-neutral-400">{product.category.name}</p>
        )}
        <h3 className="text-sm font-medium">{product.name}</h3>
        <p className="mt-1 text-sm font-bold">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}
