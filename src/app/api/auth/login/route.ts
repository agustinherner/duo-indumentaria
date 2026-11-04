import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signToken, setSessionCookie } from "@/lib/auth";
import { rateLimit, resetRateLimit, getClientIp, tooManyRequests } from "@/lib/rateLimit";

// 5 intentos cada 15 minutos, por IP y por email (frena fuerza bruta sobre una cuenta
// aunque el atacante cambie de IP).
const LIMIT = 5;
const WINDOW_MS = 15 * 60 * 1000;

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const byIp = await rateLimit({ key: `login:ip:${getClientIp(req)}`, limit: LIMIT, windowMs: WINDOW_MS });
  if (!byIp.ok) return tooManyRequests(byIp, "intentos de inicio de sesión");

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  const { email, password } = parsed.data;

  const emailKey = `login:email:${email.toLowerCase()}`;
  const byEmail = await rateLimit({ key: emailKey, limit: LIMIT, windowMs: WINDOW_MS });
  if (!byEmail.ok) return tooManyRequests(byEmail, "intentos de inicio de sesión");

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ error: "Email o contraseña incorrectos." }, { status: 401 });
  }

  if (!user.emailVerified) {
    return NextResponse.json(
      { error: "Todavía no verificaste tu email. Revisá tu casilla." },
      { status: 403 }
    );
  }

  // Contraseña correcta: se limpian los intentos de esa cuenta (los de la IP siguen).
  await resetRateLimit(emailKey);

  const token = signToken({ id: user.id, email: user.email, name: user.name, role: user.role });
  setSessionCookie(token);

  return NextResponse.json({ ok: true, user: { name: user.name, role: user.role } });
}
