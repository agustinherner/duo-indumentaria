import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Webhook de Mercado Pago. Recibe notificaciones de pago y actualiza la orden.
 * Para verificar el estado real se consulta la API de MP con el access token.
 */
export async function POST(req: NextRequest) {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) return NextResponse.json({ ok: true });

  try {
    const body = await req.json().catch(() => ({}));
    const url = new URL(req.url);
    const type = body?.type || url.searchParams.get("type");
    const paymentId = body?.data?.id || url.searchParams.get("data.id");

    if (type === "payment" && paymentId) {
      const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const payment = await res.json();
      const orderId = payment?.external_reference;
      if (orderId) {
        const status =
          payment.status === "approved"
            ? "paid"
            : payment.status === "cancelled" || payment.status === "rejected"
            ? "cancelled"
            : "pending";
        await prisma.order.update({
          where: { id: orderId },
          data: { status, paymentId: String(paymentId) },
        });
      }
    }
  } catch (e) {
    console.error("Webhook MP error:", e);
  }

  return NextResponse.json({ ok: true });
}
