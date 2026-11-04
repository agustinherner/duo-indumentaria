# Hosting: Railway vs. Vercel + Neon

*Comparación para Duo Indumentaria · noviembre 2026 · solo análisis, no se creó ninguna cuenta.*

> Los precios son aproximados, en dólares y sin impuestos. Salen de las páginas de precios y de
> guías de terceros de 2026, que no siempre coinciden. **Confirmalos en railway.com/pricing,
> vercel.com/pricing y neon.com/pricing antes de decidir.** Al pagar con tarjeta en dólares desde
> Argentina se suman las percepciones/impuestos vigentes.

## Lo que necesita este proyecto

- Next.js 14 con rutas de API (checkout, login, admin, webhook de Mercado Pago).
- Una base PostgreSQL chica: unas pocas tablas, cientos o miles de pedidos. Entra holgada en 0,5 GB.
- Migraciones de Prisma (`npm run db:deploy`) en cada deploy.
- Fotos de productos que el admin sube desde el panel (hoy se guardan en `public/uploads`).
- Límite de intentos en login/registro/newsletter, hoy en memoria (`src/lib/rateLimit.ts`).
- Tráfico bajo: una tienda local con envíos a todo el país.

## Resumen

| | **Railway** (app + PostgreSQL) | **Vercel + Neon** |
|---|---|---|
| Costo aproximado | **US$ 5–15/mes** (plan Hobby US$ 5, incluye US$ 5 de consumo) | **US$ 20–30/mes** (Vercel Pro US$ 20 + Neon gratis o pocos dólares) |
| Plan gratis usable | No para producción | Vercel Hobby **no permite uso comercial**; una tienda necesita Pro |
| Cómo corre la app | Un servidor Node siempre prendido (`next start`) | Funciones serverless que arrancan a demanda |
| Imágenes | Servicio externo recomendado (o volumen + ajuste de código) | **Obligatorio** servicio externo |
| Migraciones | "Pre-deploy command" de Railway | En el build de Vercel o en una GitHub Action |
| Límite de intentos en memoria | **Funciona** (con 1 réplica) | **No sirve**: hay que pasar a Upstash Redis |
| Cambios de código para publicar | Mínimos | Imágenes + rate limit + `directUrl` de Neon |
| Todo en un panel | Sí | No: dos cuentas, dos facturas |

## Costo

**Railway.** Plan Hobby: US$ 5/mes, que incluyen US$ 5 de consumo (CPU, RAM, disco, tráfico,
medidos por segundo). Una app Next.js chica (~300–500 MB de RAM) más un PostgreSQL chico,
prendidos todo el mes, suelen quedar entre US$ 5 y 15. Se puede poner un tope de gasto. El
plan Pro (US$ 20/mes por asiento) recién haría falta para más réplicas o soporte.

**Vercel + Neon.**
- Vercel Hobby es gratis pero **solo para uso personal no comercial**; una tienda que vende
  entra en Pro: **US$ 20/mes por usuario**, con uso adicional medido (para este tráfico, no
  debería pasar de lo incluido).
- Neon: el plan gratis (0,5 GB de almacenamiento, 100 horas de cómputo por mes, la base se
  "duerme" sin uso) alcanza para arrancar. La primera consulta después de dormir tarda
  ~0,5–1 s. Si se queda corto, el plan Launch se cobra por uso (del orden de US$ 0,11 por
  hora de cómputo), probablemente unos pocos dólares al mes.
- Sumando Upstash (gratis para este volumen) y las imágenes (ver abajo): **US$ 20–30/mes**.

## Imágenes de productos

Hoy el admin guarda las fotos en `public/uploads`. Eso no sirve en ninguno de los dos:
Next.js no sirve archivos que se agregan a `public/` después de compilar, y cada deploy
arranca de una copia limpia.

- **Railway:** se puede montar un *volumen* persistente (disco que sobrevive a los deploys),
  pero habría que agregar una ruta que sirva las fotos desde ahí. Funciona, aunque las fotos
  quedan atadas a ese servidor y sin CDN.
- **Vercel:** el disco es de solo lectura/temporal, así que **sí o sí** hace falta un servicio
  externo.

En los dos casos lo más prolijo es un almacenamiento externo con CDN: **Cloudinary** (plan
gratis generoso, además redimensiona y comprime), **Cloudflare R2** (barato, sin costo de
salida) o **Vercel Blob** (cómodo si se elige Vercel). Es un cambio en
`src/app/api/admin/upload/route.ts` y el mismo trabajo para ambas opciones.

## Migraciones

El comando es el mismo: `npm run db:deploy` (= `prisma migrate deploy`). Aplica solo las
migraciones pendientes y no borra datos.

- **Railway:** se configura como *Pre-deploy command* del servicio. Corre antes de arrancar
  la versión nueva; si falla, el deploy se frena y sigue andando la versión anterior.
- **Vercel + Neon:**
  - Se puede cambiar el *Build Command* a `prisma migrate deploy && npm run build`, o
    correrlo desde una GitHub Action antes del deploy.
  - Ojo: Vercel también compila las *previews* (cada rama/PR). Si comparten la base de
    producción, una preview podría aplicar una migración a producción. Hay que darles otra
    base (Neon tiene *branches* de base para esto) o no migrar en las previews.
  - Neon da dos URLs: una con *pooling* (para la app, recomendada en serverless) y una
    directa (para migraciones). Hay que sumar `directUrl = env("DIRECT_URL")` en
    `prisma/schema.prisma` y cargar las dos variables.

## Límite de intentos en memoria

`src/lib/rateLimit.ts` guarda los contadores en la memoria del proceso.

- **Railway:** con un solo servidor siempre prendido **funciona como está**. Lo único que pasa
  es que los contadores se reinician en cada deploy (aceptable). Si algún día se suben
  réplicas, hay que pasar a Redis.
- **Vercel:** cada función serverless tiene su propia memoria y se reinicia seguido, así que el
  límite casi no frena nada. Hay que implementar un `RateLimitStore` con **Upstash Redis**
  (tiene plan gratis y una librería para esto). El helper ya está preparado: se cambia el
  almacenamiento y las rutas no se tocan.

## Otros puntos

- **Webhook de Mercado Pago y mails:** funcionan igual en los dos (solo necesitan una URL
  pública con HTTPS y las variables de entorno).
- **Dominio propio con HTTPS:** los dos lo dan gratis.
- **Rendimiento:** Vercel tiene mejor CDN global para páginas y archivos estáticos; para una
  tienda con clientes en Argentina y este tráfico, la diferencia no se nota. Railway, al ser
  un servidor siempre prendido, no tiene "arranques en frío".
- **Backups de la base:** Neon permite volver a cualquier momento reciente (según el plan).
  En Railway hay backups del volumen de PostgreSQL; conviene además un `pg_dump` periódico
  en cualquiera de los dos.

## Recomendación

**Railway** para esta etapa. Es más barato (≈ US$ 5–15 contra ≈ US$ 20–30 por mes), deja app
y base en un solo lugar, corre las migraciones de forma simple y segura, y el límite de
intentos funciona sin cambios. El único trabajo previo obligatorio es el mismo que en la otra
opción: mover las fotos a un servicio externo (Cloudinary o R2).

Vercel + Neon conviene si más adelante se espera mucho tráfico o picos fuertes, o si se
prioriza el CDN y las previews por rama. En ese caso hay que sumar Upstash para el límite de
intentos y el `directUrl` de Neon.

La decisión queda a cargo del dueño del proyecto.
