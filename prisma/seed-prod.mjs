// Seed de PRODUCCIÓN: crea solo las categorías y el usuario admin.
// A diferencia de prisma/seed.ts, NO carga productos de ejemplo.
// Es seguro correrlo en cada deploy: usa upsert, así que no duplica nada.
// La contraseña del admin se toma de ADMIN_PASSWORD (variable del hosting).
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

async function main() {
  for (const c of categories) {
    // update vacío: si el local ya editó una categoría desde el admin, no se pisa
    await prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: c });
  }
  console.log("Seed prod: categorías OK");

  const adminEmail = process.env.ADMIN_EMAIL || "admin@duoindumentaria.com";
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword || adminPassword.length < 8) {
    console.warn("Seed prod: falta ADMIN_PASSWORD (mínimo 8 caracteres); no se crea/actualiza el admin.");
    return;
  }
  const passwordHash = await bcrypt.hash(adminPassword, 10);
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
  console.log(`Seed prod: admin ${adminEmail} OK`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
