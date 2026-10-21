import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Token faltante" }, { status: 400 });

  const record = await prisma.verificationToken.findUnique({ where: { token } });
  if (!record || record.type !== "email" || record.expiresAt < new Date()) {
    return NextResponse.json({ error: "El link es inválido o expiró." }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: record.userId },
    data: { emailVerified: new Date() },
  });
  await prisma.verificationToken.delete({ where: { id: record.id } });

  return NextResponse.json({ ok: true, message: "¡Email verificado! Ya podés iniciar sesión." });
}
