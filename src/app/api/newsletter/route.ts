import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendMail, newsletterWelcomeHtml } from "@/lib/mail";

const schema = z.object({ email: z.string().email("Email inválido") });

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const email = parsed.data.email.toLowerCase();

  const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ ok: true, message: "¡Ya estabas suscripto! 🙌" });
  }

  await prisma.newsletterSubscriber.create({ data: { email } });
  await sendMail({
    to: email,
    subject: "¡Bienvenido al newsletter de Duo Indumentaria!",
    html: newsletterWelcomeHtml(),
  });

  return NextResponse.json({ ok: true, message: "¡Listo! Ya estás suscripto. 🎉" });
}
