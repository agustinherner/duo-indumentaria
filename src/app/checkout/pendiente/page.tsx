import Link from "next/link";

export const dynamic = "force-dynamic";

export default function PendientePage() {
  return (
    <div className="container-page py-24 text-center">
      <p className="text-6xl">⏳</p>
      <h1 className="mt-4 text-3xl font-bold">Tu pago está pendiente</h1>
      <p className="mx-auto mt-4 max-w-md text-neutral-600">
        Estamos esperando la confirmación del pago (por ejemplo, si pagaste con efectivo en Rapipago o
        Pago Fácil). Te avisaremos por mail apenas se acredite.
      </p>
      <Link href="/productos" className="btn-dark mt-8">
        Seguir comprando
      </Link>
    </div>
  );
}
