import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Sin esto Next la genera una sola vez al compilar y el menú no muestra categorías nuevas
export const dynamic = "force-dynamic";

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return NextResponse.json({ categories });
}
