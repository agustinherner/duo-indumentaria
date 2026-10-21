import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const b = await req.json().catch(() => ({}));

  const data: Record<string, unknown> = {};
  if (b.name !== undefined) data.name = b.name;
  if (b.description !== undefined) data.description = b.description;
  if (b.price !== undefined) data.price = Math.round(Number(b.price) || 0);
  if (b.emoji !== undefined) data.emoji = b.emoji;
  if (b.imageUrl !== undefined) data.imageUrl = b.imageUrl;
  if (b.sizes !== undefined) data.sizes = b.sizes;
  if (b.stock !== undefined) data.stock = Math.round(Number(b.stock) || 0);
  if (b.featured !== undefined) data.featured = Boolean(b.featured);
  if (b.active !== undefined) data.active = Boolean(b.active);
  if (b.categoryId !== undefined) data.categoryId = b.categoryId;

  const product = await prisma.product.update({ where: { id: params.id }, data });
  return NextResponse.json({ product });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  await prisma.product.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
