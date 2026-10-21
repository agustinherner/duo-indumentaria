import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

export const dynamic = "force-dynamic";

const nav = [
  { href: "/admin", label: "Resumen", icon: "📊" },
  { href: "/admin/productos", label: "Productos", icon: "🛍️" },
  { href: "/admin/categorias", label: "Categorías", icon: "🗂️" },
  { href: "/admin/pedidos", label: "Pedidos", icon: "📦" },
  { href: "/admin/newsletter", label: "Newsletter", icon: "✉️" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/cuenta/login");
  if (user.role !== "admin") redirect("/");

  return (
    <div className="admin-theme min-h-screen">
      <div className="mx-auto flex max-w-page flex-col gap-6 px-4 py-6 lg:flex-row">
        <aside className="lg:w-60 lg:shrink-0">
          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <p className="px-2 text-xs font-bold uppercase tracking-widest text-neutral-400">
              Duo · Admin
            </p>
            <nav className="mt-3 space-y-1">
              {nav.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-neutral-100"
                >
                  <span>{n.icon}</span>
                  {n.label}
                </Link>
              ))}
            </nav>
            <div className="mt-4 border-t border-neutral-200 pt-4">
              <Link href="/" className="block px-3 py-1 text-sm text-neutral-500 hover:text-ink">
                ← Volver a la tienda
              </Link>
              <div className="mt-2 px-1">
                <LogoutButton />
              </div>
            </div>
          </div>
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
