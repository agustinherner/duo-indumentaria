import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [products, categories, orders, subscribers, paidOrders] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.order.count(),
    prisma.newsletterSubscriber.count(),
    prisma.order.findMany({ where: { status: "paid" }, select: { total: true } }),
  ]);

  const revenue = paidOrders.reduce((s: number, o: { total: number }) => s + o.total, 0);
  const recentOrders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const cards = [
    { label: "Productos", value: products, href: "/admin/productos" },
    { label: "Categorías", value: categories, href: "/admin/categorias" },
    { label: "Pedidos", value: orders, href: "/admin/pedidos" },
    { label: "Suscriptores", value: subscribers, href: "/admin/newsletter" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Resumen</h1>
      <p className="text-neutral-500">Vista general de tu tienda.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="rounded-xl border border-neutral-200 bg-white p-5 transition hover:border-ink"
          >
            <p className="text-sm text-neutral-500">{c.label}</p>
            <p className="mt-1 text-3xl font-bold">{c.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-5">
        <p className="text-sm text-neutral-500">Ingresos (pedidos pagados)</p>
        <p className="mt-1 text-3xl font-bold">{formatPrice(revenue)}</p>
      </div>

      <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold">Últimos pedidos</h2>
          <Link href="/admin/pedidos" className="text-sm underline">
            Ver todos
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-neutral-500">Todavía no hay pedidos.</p>
        ) : (
          <ul className="divide-y divide-neutral-100 text-sm">
            {recentOrders.map((o: (typeof recentOrders)[number]) => (
              <li key={o.id} className="flex justify-between py-2">
                <span>#{o.id.slice(-6).toUpperCase()} · {o.fullName}</span>
                <span className="font-semibold">{formatPrice(o.total)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
