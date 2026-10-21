import Link from "next/link";
import NewsletterForm from "./NewsletterForm";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-neutral-800 bg-ink text-white">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div>
          <h3 className="text-lg font-bold tracking-widest">DUO INDUMENTARIA</h3>
          <p className="mt-3 text-sm text-neutral-400">
            Tu tienda de ropa en Santa Rosa, La Pampa. Envíos a todo el país.
          </p>
          <p className="mt-4 text-sm text-neutral-400">
            📍 25 de Mayo 466, Santa Rosa (La Pampa)
            <br />
            🕘 Lun a Sáb: 9 a 13 y 16:30 a 21 hs
          </p>
        </div>

        <div>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-neutral-500">Tienda</h4>
          <ul className="space-y-2 text-sm text-neutral-300">
            <li><Link href="/productos" className="hover:text-white">Todos los productos</Link></li>
            <li><Link href="/categoria/buzos" className="hover:text-white">Buzos</Link></li>
            <li><Link href="/categoria/remeras" className="hover:text-white">Remeras</Link></li>
            <li><Link href="/categoria/jeans" className="hover:text-white">Jeans</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-neutral-500">Ayuda</h4>
          <ul className="space-y-2 text-sm text-neutral-300">
            <li><Link href="/envios" className="hover:text-white">Envíos y devoluciones</Link></li>
            <li><Link href="/contacto" className="hover:text-white">Contacto</Link></li>
            <li><Link href="/cuenta" className="hover:text-white">Mi cuenta</Link></li>
            <li><Link href="/cuenta/login" className="hover:text-white">Ingresar</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-neutral-500">Newsletter</h4>
          <p className="mb-3 text-sm text-neutral-400">Suscribite y enterate de lanzamientos y descuentos.</p>
          <NewsletterForm dark />
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-neutral-500">
        © {new Date().getFullYear()} Duo Indumentaria. Todos los derechos reservados.
      </div>
    </footer>
  );
}
