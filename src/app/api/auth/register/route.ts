import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { sendMail, verificationEmailHtml } from "@/lib/mail";

const schema = z.object({
  name: z.string().min(2, "Ingresá tu nombre"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    return NextResponse.json({ error: "Ya existe una cuenta con ese email." }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      passwordHash: await hashPassword(password),
      role: "customer",
    },
  });

  const token = randomBytes(32).toString("hex");
  await prisma.verificationToken.create({
    data: {
      token,
      type: "email",
      userId: user.id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
    },
  });

  const link = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/cuenta/verificar?token=${token}`;
  const mail = await sendMail({
    to: user.email,
    subject: "Verificá tu cuenta — Duo Indumentaria",
    html: verificationEmailHtml(user.name, link),
  });

  // El link solo se muestra en pantalla en desarrollo: en producción permitiría
  // verificar mails ajenos si el SMTP no está configurado.
  const showDevLink = mail.dev && process.env.NODE_ENV !== "production";

  return NextResponse.json({
    ok: true,
    devMailLink: showDevLink ? link : undefined,
    message: "Cuenta creada. Revisá tu email para verificar la cuenta.",
  });
}
