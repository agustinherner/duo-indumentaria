import Link from "next/link";

export const dynamic = "force-dynamic";

export default function ExitoPage({ searchParams }: { searchParams: { order?: string; manual?: string } }) {
  const shortId = searchParams.order?.slice(-6).toUpperCase();
  const manual = searchParams.manual === "1";
  return (
    <div className="container-page py-24 text-center">
      <p className="text-6xl">✅</p>
      <h1 className="mt-4 text-3xl font-bold">¡Gracias por tu compra!</h1>
      {shortId && <p className="mt-2 text-neutral-500">Tu pedido es el #{shortId}</p>}
      {manual ? (
        <p className="mx-auto mt-4 max-w-md text-neutral-600">
          Recibimos tu pedido. Te vamos a contactar por email o teléfono para coordinar el pago y el
          envío. ¡Gracias por elegir Duo Indumentaria!
        </p>
      ) : (
        <p className="mx-auto mt-4 max-w-md text-neutral-600">
          Tu pago fue aprobado. Te enviamos un mail con el detalle de tu pedido. Prepararemos tu compra
          y te avisaremos cuando la despachemos.
        </p>
      )}
      <Link href="/productos" className="btn-dark mt-8">
        Seguir comprando
      </Link>
    </div>
  );
}
