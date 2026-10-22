import nodemailer from "nodemailer";

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  MAIL_FROM,
} = process.env;

const isConfigured = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);

const transporter = isConfigured
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT || 587),
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    })
  : null;

type MailOptions = { to: string; subject: string; html: string };

/**
 * Envía un mail. Si no hay SMTP configurado, lo imprime en la consola del
 * servidor (modo desarrollo) para que puedas copiar el link de verificación.
 */
export async function sendMail({ to, subject, html }: MailOptions) {
  if (!transporter) {
    if (process.env.NODE_ENV === "production") {
      console.error(`⚠️ SMTP no configurado: no se envió el mail "${subject}" a ${to}.`);
      return { ok: false, dev: true };
    }
    console.log("\n📧 [MAIL - modo desarrollo, SMTP no configurado]");
    console.log(`Para: ${to}`);
    console.log(`Asunto: ${subject}`);
    console.log("Contenido HTML:\n" + html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
    console.log("---\n");
    return { ok: true, dev: true };
  }
  await transporter.sendMail({
    from: MAIL_FROM || "Duo Indumentaria <no-reply@duoindumentaria.com>",
    to,
    subject,
    html,
  });
  return { ok: true, dev: false };
}

export function verificationEmailHtml(name: string, link: string) {
  return `
  <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;background:#0a0a0a;color:#fff;padding:32px;border-radius:12px">
    <h1 style="letter-spacing:2px;font-size:26px;margin:0 0 8px">DUO INDUMENTARIA</h1>
    <p style="color:#bbb">Hola ${name}, ¡gracias por registrarte!</p>
    <p style="color:#bbb">Confirmá tu dirección de mail para activar tu cuenta:</p>
    <p style="text-align:center;margin:28px 0">
      <a href="${link}" style="background:#fff;color:#0a0a0a;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:bold;display:inline-block">Verificar mi mail</a>
    </p>
    <p style="color:#666;font-size:12px">Si el botón no funciona, copiá este link:<br>${link}</p>
  </div>`;
}

export function newsletterWelcomeHtml() {
  return `
  <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;background:#0a0a0a;color:#fff;padding:32px;border-radius:12px">
    <h1 style="letter-spacing:2px;font-size:26px;margin:0 0 8px">DUO INDUMENTARIA</h1>
    <p style="color:#bbb">¡Te sumaste al newsletter! 🎉</p>
    <p style="color:#bbb">Vas a recibir novedades, lanzamientos y descuentos exclusivos antes que nadie.</p>
  </div>`;
}

export function orderConfirmationHtml(orderId: string, total: string) {
  return `
  <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;background:#0a0a0a;color:#fff;padding:32px;border-radius:12px">
    <h1 style="letter-spacing:2px;font-size:24px;margin:0 0 8px">DUO INDUMENTARIA</h1>
    <p style="color:#bbb">Recibimos tu pedido <b>#${orderId.slice(-6).toUpperCase()}</b>.</p>
    <p style="color:#bbb">Total: <b>${total}</b></p>
    <p style="color:#bbb">Te avisamos por mail cuando confirmemos el pago y despachemos tu compra.</p>
  </div>`;
}
