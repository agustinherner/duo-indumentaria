import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const categories = [
  { name: "Buzos", slug: "buzos", emoji: "🧥", order: 1 },
  { name: "Remeras", slug: "remeras", emoji: "👕", order: 2 },
  { name: "Camperas", slug: "camperas", emoji: "🧥", order: 3 },
  { name: "Boxer", slug: "boxer", emoji: "🩲", order: 4 },
  { name: "Jeans", slug: "jeans", emoji: "👖", order: 5 },
  { name: "Joggins", slug: "joggins", emoji: "👖", order: 6 },
  { name: "Sueter", slug: "sueter", emoji: "🧶", order: 7 },
  { name: "Chalecos", slug: "chalecos", emoji: "🦺", order: 8 },
];

// Productos de ejemplo (placeholder con emoji). Se editan desde el admin.
const sampleProducts: Record<string, { name: string; price: number; emoji: string; featured?: boolean }[]> = {
  buzos: [
    { name: "Buzo Canguro Duo Classic", price: 34999, emoji: "🧥", featured: true },
    { name: "Buzo Oversize Negro", price: 37999, emoji: "🧥" },
    { name: "Buzo Frisa Gris", price: 32999, emoji: "🧥" },
  ],
  remeras: [
    { name: "Remera Oversize Duo", price: 18999, emoji: "👕", featured: true },
    { name: "Remera Básica Blanca", price: 14999, emoji: "👕" },
    { name: "Remera Estampada Street", price: 19999, emoji: "👕" },
  ],
  camperas: [
    { name: "Campera Rompeviento", price: 54999, emoji: "🧥", featured: true },
    { name: "Campera Puffer Negra", price: 69999, emoji: "🧥" },
  ],
  boxer: [
    { name: "Boxer Pack x3", price: 12999, emoji: "🩲" },
    { name: "Boxer Algodón Premium", price: 5999, emoji: "🩲" },
  ],
  jeans: [
    { name: "Jean Slim Azul", price: 42999, emoji: "👖", featured: true },
    { name: "Jean Recto Negro", price: 44999, emoji: "👖" },
  ],
  joggins: [
    { name: "Jogging Frisa Negro", price: 29999, emoji: "👖" },
    { name: "Jogging Cargo Beige", price: 33999, emoji: "👖" },
  ],
  sueter: [
    { name: "Sueter Hilo Fino", price: 27999, emoji: "🧶" },
    { name: "Sueter Trenzado", price: 31999, emoji: "🧶" },
  ],
  chalecos: [
    { name: "Chaleco Inflable Negro", price: 39999, emoji: "🦺" },
    { name: "Chaleco Polar", price: 25999, emoji: "🦺" },
  ],
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  console.log("🌱 Seed: creando categorías...");
  const categoryMap: Record<string, string> = {};
  for (const c of categories) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, emoji: c.emoji, order: c.order },
      create: c,
    });
    categoryMap[c.slug] = cat.id;
  }

  console.log("🛍️  Seed: creando productos de ejemplo...");
  for (const [catSlug, products] of Object.entries(sampleProducts)) {
    for (const p of products) {
      const slug = slugify(p.name);
      await prisma.product.upsert({
        where: { slug },
        update: {},
        create: {
          name: p.name,
          slug,
          price: p.price,
          emoji: p.emoji,
          featured: p.featured ?? false,
          stock: 25,
          sizes: catSlug === "boxer" || catSlug === "jeans" || catSlug === "joggins" ? "S,M,L,XL,XXL" : "S,M,L,XL",
          description: `${p.name} — prenda de la nueva colección de Duo Indumentaria. Editá esta descripción, el precio y la imagen desde el panel de administración.`,
          categoryId: categoryMap[catSlug],
        },
      });
    }
  }

  console.log("👤 Seed: creando usuario admin...");
  const adminEmail = process.env.ADMIN_EMAIL || "admin@duoindumentaria.com";
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword || adminPassword.length < 8) {
    throw new Error("Definí ADMIN_PASSWORD en .env (mínimo 8 caracteres) antes de correr el seed.");
  }
  if (adminPassword === "Duo2026!") {
    console.warn("⚠️  ADMIN_PASSWORD sigue siendo la de ejemplo: cambiala antes de publicar la tienda.");
  }
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  // Al volver a correr el seed, la contraseña del admin se actualiza con la de .env
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "admin", emailVerified: new Date(), passwordHash },
    create: {
      email: adminEmail,
      name: "Administrador Duo",
      passwordHash,
      role: "admin",
      emailVerified: new Date(),
    },
  });

  console.log(`✅ Listo. Admin: ${adminEmail} (contraseña: la de ADMIN_PASSWORD en .env)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
