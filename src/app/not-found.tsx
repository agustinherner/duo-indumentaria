import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page py-24 text-center">
      <p className="text-6xl">🧦</p>
      <h1 className="mt-4 text-3xl font-bold">Página no encontrada</h1>
      <p className="mt-2 text-neutral-500">La página que buscás no existe o se movió.</p>
      <Link href="/" className="btn-dark mt-8">
        Volver al inicio
      </Link>
    </div>
  );
}
