import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const featured = searchParams.get("featured");
  const q = searchParams.get("q");

  const products = await prisma.product.findMany({
    where: {
      active: true,
      ...(category ? { category: { slug: category } } : {}),
      ...(featured === "true" ? { featured: true } : {}),
      ...(q ? { name: { contains: q } } : {}),
    },
    include: { category: { select: { name: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ products });
}
