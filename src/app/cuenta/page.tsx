import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import LogoutButton from "@/components/LogoutButton";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  pending: "Pendiente de pago",
  paid: "Pagado",
  shipped: "Enviado",
  cancelled: "Cancelado",
};

export default async function CuentaPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/cuenta/login");

  const orders = await prisma.order.findMany({
    where: { OR: [{ userId: user.id }, { email: user.email }] },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container-page py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Hola, {user.name.split(" ")[0]} 👋</h1>
          <p className="text-neutral-400">{user.email}</p>
        </div>
        <div className="flex gap-3">
          {user.role === "admin" && (
            <Link href="/admin" className="btn-dark">
              Panel Admin
            </Link>
          )}
          <LogoutButton />
        </div>
      </div>

      <h2 className="mb-4 text-xl font-bold">Mis pedidos</h2>
      {orders.length === 0 ? (
        <div className="rounded-lg border border-neutral-800 p-8 text-center text-neutral-400">
          <p>Todavía no hiciste ningún pedido.</p>
          <Link href="/productos" className="btn-dark mt-4">
            Ver productos
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o: (typeof orders)[number]) => (
            <div key={o.id} className="rounded-lg border border-neutral-800 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">Pedido #{o.id.slice(-6).toUpperCase()}</p>
                  <p className="text-sm text-neutral-400">
                    {new Date(o.createdAt).toLocaleDateString("es-AR")}
                  </p>
                </div>
                <span className="rounded-full bg-neutral-800 px-3 py-1 text-xs font-semibold text-neutral-200">
                  {statusLabels[o.status] || o.status}
                </span>
              </div>
              <ul className="mt-3 space-y-1 text-sm text-neutral-300">
                {o.items.map((it: (typeof o.items)[number]) => (
                  <li key={it.id}>
                    {it.name} × {it.quantity} {it.size && `(${it.size})`}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-right font-bold">{formatPrice(o.total)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
