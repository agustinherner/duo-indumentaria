import { MercadoPagoConfig, Preference } from "mercadopago";

const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || "";

export const isMercadoPagoConfigured = Boolean(accessToken);

export function getPreferenceClient() {
  if (!accessToken) return null;
  const client = new MercadoPagoConfig({ accessToken });
  return new Preference(client);
}
