import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const products = await prisma.product.findMany({
    include: { category: { select: { name: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  if (!b.name || !b.categoryId) {
    return NextResponse.json({ error: "Nombre y categoría son obligatorios." }, { status: 400 });
  }

  let slug = slugify(b.name);
  const exists = await prisma.product.findUnique({ where: { slug } });
  if (exists) slug = `${slug}-${Date.now().toString().slice(-4)}`;

  const product = await prisma.product.create({
    data: {
      name: b.name,
      slug,
      description: b.description || "",
      price: Math.round(Number(b.price) || 0),
      emoji: b.emoji || "👕",
      imageUrl: b.imageUrl || "",
      sizes: b.sizes || "S,M,L,XL",
      stock: Math.round(Number(b.stock) || 0),
      featured: Boolean(b.featured),
      active: b.active !== false,
      categoryId: b.categoryId,
    },
  });
  return NextResponse.json({ product });
}
