import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const data: Record<string, unknown> = {};
  if (b.name !== undefined) data.name = b.name;
  if (b.emoji !== undefined) data.emoji = b.emoji;
  if (b.order !== undefined) data.order = Number(b.order);

  const category = await prisma.category.update({ where: { id: params.id }, data });
  return NextResponse.json({ category });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const count = await prisma.product.count({ where: { categoryId: params.id } });
  if (count > 0) {
    return NextResponse.json(
      { error: "No se puede borrar: la categoría tiene productos. Movelos o borralos primero." },
      { status: 400 }
    );
  }
  await prisma.category.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
