import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getPreferenceClient, isMercadoPagoConfigured } from "@/lib/mercadopago";
import { sendMail, orderConfirmationHtml } from "@/lib/mail";
import { formatPrice } from "@/lib/utils";

const schema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string(),
        size: z.string().default(""),
        quantity: z.number().int().min(1),
      })
    )
    .min(1),
  customer: z.object({
    fullName: z.string().min(2),
    email: z.string().email(),
    phone: z.string().default(""),
    address: z.string().default(""),
    city: z.string().default(""),
    province: z.string().default(""),
    zip: z.string().default(""),
    notes: z.string().default(""),
  }),
});

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos de checkout inválidos." }, { status: 400 });
  }
  const { items, customer } = parsed.data;

  // Traer precios reales desde la base (no confiamos en el precio del cliente)
  type ProductRow = { id: string; name: string; price: number };
  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.productId) } },
  });
  const map = new Map<string, ProductRow>(
    (products as ProductRow[]).map((p) => [p.id, p] as [string, ProductRow])
  );

  const orderItems = items.map((i) => {
    const p = map.get(i.productId);
    if (!p) throw new Error("Producto inexistente");
    return { product: p, size: i.size, quantity: i.quantity };
  });

  const missing = items.find((i) => !map.get(i.productId));
  if (missing) {
    return NextResponse.json({ error: "Alguno de los productos ya no está disponible." }, { status: 400 });
  }

  const total = orderItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const user = await getCurrentUser();

  const order = await prisma.order.create({
    data: {
      userId: user?.id,
      email: customer.email.toLowerCase(),
      fullName: customer.fullName,
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
      province: customer.province,
      zip: customer.zip,
      notes: customer.notes,
      total,
      status: "pending",
      items: {
        create: orderItems.map((i) => ({
          productId: i.product.id,
          name: i.product.name,
          price: i.product.price,
          quantity: i.quantity,
          size: i.size,
        })),
      },
    },
  });

  await sendMail({
    to: customer.email,
    subject: `Tu pedido en Duo Indumentaria #${order.id.slice(-6).toUpperCase()}`,
    html: orderConfirmationHtml(order.id, formatPrice(total)),
  }).catch(() => {});

  // Si Mercado Pago está configurado, creamos la preferencia de pago
  if (isMercadoPagoConfigured) {
    const pref = getPreferenceClient();
    try {
      const result = await pref!.create({
        body: {
          items: orderItems.map((i) => ({
            id: i.product.id,
            title: i.product.name,
            quantity: i.quantity,
            unit_price: i.product.price,
            currency_id: "ARS",
          })),
          payer: { name: customer.fullName, email: customer.email },
          external_reference: order.id,
          back_urls: {
            success: `${SITE}/checkout/exito?order=${order.id}`,
            failure: `${SITE}/checkout/error?order=${order.id}`,
            pending: `${SITE}/checkout/pendiente?order=${order.id}`,
          },
          auto_return: "approved",
          notification_url: `${SITE}/api/webhooks/mercadopago`,
        },
      });
      return NextResponse.json({
        ok: true,
        orderId: order.id,
        redirectUrl: result.init_point,
        provider: "mercadopago",
      });
    } catch (e) {
      console.error("Error creando preferencia MP:", e);
      // Cae al flujo manual si MP falla
    }
  }

  // Flujo sin pago online configurado: se coordina el pago manualmente
  return NextResponse.json({
    ok: true,
    orderId: order.id,
    redirectUrl: `${SITE}/checkout/exito?order=${order.id}&manual=1`,
    provider: "manual",
  });
}
