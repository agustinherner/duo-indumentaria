import Link from "next/link";

export const dynamic = "force-dynamic";

export default function ErrorPage() {
  return (
    <div className="container-page py-24 text-center">
      <p className="text-6xl">⚠️</p>
      <h1 className="mt-4 text-3xl font-bold">El pago no se completó</h1>
      <p className="mx-auto mt-4 max-w-md text-neutral-600">
        Hubo un problema al procesar tu pago o lo cancelaste. Podés intentar de nuevo desde tu carrito.
      </p>
      <Link href="/carrito" className="btn-dark mt-8">
        Volver al carrito
      </Link>
    </div>
  );
}
