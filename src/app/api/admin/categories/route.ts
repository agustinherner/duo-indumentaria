import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return NextResponse.json({ categories });
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  if (!b.name) return NextResponse.json({ error: "El nombre es obligatorio." }, { status: 400 });

  let slug = slugify(b.name);
  const exists = await prisma.category.findUnique({ where: { slug } });
  if (exists) slug = `${slug}-${Date.now().toString().slice(-4)}`;

  const count = await prisma.category.count();
  const category = await prisma.category.create({
    data: { name: b.name, slug, emoji: b.emoji || "👕", order: b.order ?? count + 1 },
  });
  return NextResponse.json({ category });
}
