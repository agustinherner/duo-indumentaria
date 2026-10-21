export const metadata = { title: "Envíos y devoluciones — Duo Indumentaria" };

export default function EnviosPage() {
  return (
    <div className="container-page max-w-3xl py-14">
      <h1 className="text-3xl font-bold">Envíos y devoluciones</h1>

      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-semibold">🚚 Envíos a todo el país</h2>
        <p className="text-neutral-300">
          Realizamos envíos a toda la Argentina a través de correo. El costo del envío se calcula según
          tu localidad y se coordina luego de realizar el pedido. Los tiempos de entrega estimados son de
          3 a 7 días hábiles una vez despachado el paquete.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-semibold">🏬 Retiro en el local</h2>
        <p className="text-neutral-300">
          Podés retirar tu compra sin costo en nuestro local de <b>25 de Mayo 466, Santa Rosa, La Pampa</b>.
          Te avisamos por email o teléfono cuando tu pedido esté listo para retirar.
        </p>
        <p className="text-neutral-300">
          <b>Horarios de atención:</b> Lunes a Sábados de 9:00 a 13:00 y de 16:30 a 21:00 hs.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-semibold">💳 Medios de pago</h2>
        <p className="text-neutral-300">
          Aceptamos Mercado Pago (tarjetas de crédito y débito en cuotas, dinero en cuenta, efectivo por
          Rapipago/Pago Fácil). También podés abonar en efectivo o por transferencia retirando en el local.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-semibold">↩️ Cambios y devoluciones</h2>
        <p className="text-neutral-300">
          Tenés hasta 30 días para cambiar tu prenda. El producto debe estar sin uso, con su etiqueta y en
          las mismas condiciones en que lo recibiste. Para gestionar un cambio, escribinos indicando tu
          número de pedido.
        </p>
      </section>
    </div>
  );
}
