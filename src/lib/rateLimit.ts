import { NextRequest, NextResponse } from "next/server";

/**
 * Límite de intentos (rate limiting) con ventana fija.
 *
 * La lógica (rateLimit, tooManyRequests) está separada del almacenamiento
 * (RateLimitStore). Hoy se usa MemoryStore, que guarda los contadores en la memoria
 * del proceso de Node.
 *
 * ⚠️ LIMITACIÓN IMPORTANTE: el almacenamiento en memoria solo sirve bien con UN
 * servidor que corre todo el tiempo (por ejemplo, `next start` en Railway o un VPS).
 * En plataformas serverless (Vercel, Netlify) cada instancia tiene su propia memoria
 * y se reinicia seguido, así que los contadores no se comparten entre instancias y se
 * pierden en cada arranque en frío: el límite pasa a ser "por instancia" y es fácil de
 * esquivar. Lo mismo ocurre si se corren varias réplicas del servidor.
 *
 * Para esos casos hay que implementar RateLimitStore con un almacenamiento compartido
 * (Redis / Upstash, o una tabla en la base) y cambiarlo en `setRateLimitStore` o en la
 * línea donde se crea `store`. Las rutas no se tocan: solo llaman a `rateLimit()`.
 */

export interface RateLimitHit {
  /** Cantidad de intentos dentro de la ventana actual (incluido este). */
  count: number;
  /** Momento (ms epoch) en que se reinicia la ventana. */
  resetAt: number;
}

export interface RateLimitStore {
  /** Suma un intento a la clave y devuelve el estado de la ventana. Debe ser atómico. */
  increment(key: string, windowMs: number): Promise<RateLimitHit>;
  /** Borra los intentos de una clave (por ejemplo, tras un login correcto). */
  reset(key: string): Promise<void>;
}

/** Almacenamiento en memoria del proceso. Ver la limitación arriba. */
export class MemoryStore implements RateLimitStore {
  private hits = new Map<string, RateLimitHit>();
  private ops = 0;

  async increment(key: string, windowMs: number): Promise<RateLimitHit> {
    const now = Date.now();
    this.sweep(now);
    const current = this.hits.get(key);
    if (!current || current.resetAt <= now) {
      const fresh = { count: 1, resetAt: now + windowMs };
      this.hits.set(key, fresh);
      return { ...fresh };
    }
    current.count += 1;
    return { ...current };
  }

  async reset(key: string): Promise<void> {
    this.hits.delete(key);
  }

  /** Limpia claves vencidas cada tanto, sin timers (no molestan en serverless). */
  private sweep(now: number) {
    if (++this.ops % 500 !== 0) return;
    this.hits.forEach((hit, key) => {
      if (hit.resetAt <= now) this.hits.delete(key);
    });
  }
}

// Se guarda en globalThis para que el hot reload de `next dev` no reinicie los contadores.
const globalForRateLimit = globalThis as unknown as { rateLimitStore?: RateLimitStore };
let store: RateLimitStore = globalForRateLimit.rateLimitStore ?? new MemoryStore();
globalForRateLimit.rateLimitStore = store;

/** Permite reemplazar el almacenamiento (por ejemplo, por uno de Redis/Upstash). */
export function setRateLimitStore(newStore: RateLimitStore) {
  store = newStore;
  globalForRateLimit.rateLimitStore = newStore;
}

export interface RateLimitOptions {
  /** Identifica qué se limita, por ejemplo "login:ip:1.2.3.4". */
  key: string;
  /** Intentos permitidos dentro de la ventana. */
  limit: number;
  /** Duración de la ventana en milisegundos. */
  windowMs: number;
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  /** Segundos hasta que se pueda volver a intentar. */
  retryAfter: number;
}

/** Registra un intento y dice si todavía está dentro del límite. */
export async function rateLimit({ key, limit, windowMs }: RateLimitOptions): Promise<RateLimitResult> {
  const { count, resetAt } = await store.increment(key, windowMs);
  return {
    ok: count <= limit,
    remaining: Math.max(0, limit - count),
    retryAfter: Math.max(1, Math.ceil((resetAt - Date.now()) / 1000)),
  };
}

export async function resetRateLimit(key: string) {
  await store.reset(key);
}

/**
 * IP del cliente. Detrás de un proxy (Vercel, Railway, Nginx) llega en x-real-ip o
 * x-forwarded-for. Se prefiere x-real-ip porque la pone el proxy; el primer valor de
 * x-forwarded-for lo puede inventar el cliente si el proxy solo le agrega su IP al final.
 */
export function getClientIp(req: NextRequest): string {
  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.ip || "desconocida";
}

function waitText(seconds: number): string {
  if (seconds < 60) return "unos segundos";
  const minutes = Math.ceil(seconds / 60);
  if (minutes < 60) return minutes === 1 ? "1 minuto" : `${minutes} minutos`;
  const hours = Math.ceil(minutes / 60);
  return hours === 1 ? "1 hora" : `${hours} horas`;
}

/** Respuesta 429 con un mensaje en español que los formularios muestran en `error`. */
export function tooManyRequests(result: RateLimitResult, what = "intentos") {
  return NextResponse.json(
    { error: `Demasiados ${what}. Esperá ${waitText(result.retryAfter)} y probá de nuevo.` },
    { status: 429, headers: { "Retry-After": String(result.retryAfter) } }
  );
}
