import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signToken, setSessionCookie } from "@/lib/auth";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  const { email, password } = parsed.data;

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

  const token = signToken({ id: user.id, email: user.email, name: user.name, role: user.role });
  setSessionCookie(token);

  return NextResponse.json({ ok: true, user: { name: user.name, role: user.role } });
}
