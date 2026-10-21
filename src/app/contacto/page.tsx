export const metadata = { title: "Contacto — Duo Indumentaria" };

export default function ContactoPage() {
  return (
    <div className="container-page max-w-3xl py-14">
      <h1 className="text-3xl font-bold">Contacto</h1>
      <p className="mt-3 text-neutral-300">
        ¿Tenés una consulta sobre un producto, tu pedido o un cambio? Escribinos y te respondemos a la
        brevedad.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="rounded-lg border border-neutral-800 p-6">
          <h2 className="text-lg font-semibold">📍 Nuestro local</h2>
          <p className="mt-2 text-neutral-300">
            25 de Mayo 466
            <br />
            Santa Rosa, La Pampa
            <br />
            Argentina
          </p>
        </div>
        <div className="rounded-lg border border-neutral-800 p-6">
          <h2 className="text-lg font-semibold">🕘 Horarios</h2>
          <p className="mt-2 text-neutral-300">
            Lunes a Sábados
            <br />
            9:00 a 13:00 hs
            <br />
            16:30 a 21:00 hs
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-lg bg-neutral-900 p-6">
        <h2 className="text-lg font-semibold">Seguinos y escribinos</h2>
        <p className="mt-2 text-neutral-300">
          Podés contactarnos por WhatsApp, Instagram o email. Actualizá estos datos con los reales de la
          tienda:
        </p>
        <ul className="mt-3 space-y-1 text-neutral-300">
          <li>📱 WhatsApp: (agregá tu número)</li>
          <li>📷 Instagram: @duoindumentaria</li>
          <li>✉️ Email: contacto@duoindumentaria.com</li>
        </ul>
      </div>

      <div className="mt-8 overflow-hidden rounded-lg border border-neutral-800">
        <iframe
          title="Ubicación Duo Indumentaria"
          className="h-64 w-full"
          loading="lazy"
          src="https://www.google.com/maps?q=25%20de%20Mayo%20466,%20Santa%20Rosa,%20La%20Pampa&output=embed"
        />
      </div>
    </div>
  );
}
