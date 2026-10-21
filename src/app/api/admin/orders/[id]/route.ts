import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const allowed = ["pending", "paid", "shipped", "cancelled"];
  if (!allowed.includes(b.status)) {
    return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
  }
  const order = await prisma.order.update({ where: { id: params.id }, data: { status: b.status } });
  return NextResponse.json({ order });
}
