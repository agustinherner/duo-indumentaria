# Paneo del estado — Duo Indumentaria

*Relevamiento de solo lectura · 21/10/2026 · commit `442fadd`*

## Resumen

1. La tienda **está completa como producto base**: catálogo, carrito, checkout, cuentas con verificación de mail, newsletter y panel de administración funcionan en local.
2. **La compilación de producción pasa sin errores** (`npm run build` OK, incluido el chequeo de tipos). El lint no está configurado.
3. **Mercado Pago está programado pero nunca se probó**: no hay credenciales cargadas, así que hoy los pedidos usan un "flujo manual" (se registra el pedido y el pago se coordina por fuera).
4. **Todavía no está lista para publicar**. Falta:
   - pasar de SQLite a PostgreSQL;
   - guardar las imágenes en un servicio externo;
   - configurar el envío de mails;
   - corregir algunos agujeros: el stock no se controla, el checkout da error con productos borrados y la verificación de mail se puede saltear si no hay SMTP.
5. Estimación: con **1 a 2 semanas de trabajo enfocado** queda lista para vender en línea con pagos reales.

---

## 1. Estructura y stack

```
prisma/          → schema.prisma (modelo de datos) + seed.ts (datos de ejemplo + admin)
public/          → logo.jpeg + uploads/ (fotos subidas desde el admin)
src/app/         → páginas de la tienda (inicio, productos, categoría, producto, carrito,
                   checkout, cuenta, envíos, contacto)
src/app/admin/   → panel de administración (resumen, productos, categorías, pedidos, newsletter)
src/app/api/     → endpoints del servidor (auth, productos, checkout, newsletter, admin, webhook MP)
src/components/  → Header, Footer, CartDrawer, ProductCard, AddToCartForm, etc.
src/context/     → CartContext (carrito guardado en el navegador)
src/lib/         → prisma, auth (sesión con JWT en cookie), mail (nodemailer), mercadopago, utils
```

Es un proyecto chico y prolijo: unas 3.500 líneas de código, sin código muerto ni archivos sueltos.

**Versiones instaladas:**

| Paquete | Versión |
|---|---|
| Next.js | 14.2.35 |
| React / React DOM | 18.3.1 |
| Prisma / @prisma/client | 5.22.0 |
| mercadopago (SDK) | 2.13.0 |
| nodemailer | 6.10.1 |
| jsonwebtoken / bcryptjs | 9.0.3 / 2.4.3 |
| zod (validación) | 3.25.76 |
| Tailwind CSS | 3.4.19 |
| TypeScript | 5.9.3 |

---

## 2. Qué funciona hoy

### Compilación y lint
- **`npm run build`: ✅ pasa.** Compila sin errores ni advertencias de tipos y genera las 36 rutas.
- **`npm run lint`: ⚠️ no se pudo correr.** No hay configuración de ESLint ni ESLint instalado. Correrlo abriría un asistente que instala paquetes, cosa que este relevamiento no podía hacer.

### Base de datos (Prisma)
- **Modelos:** `User`, `VerificationToken`, `Category`, `Product`, `NewsletterSubscriber`, `Order` y `OrderItem`.
- **El esquema es válido** y la base local está sincronizada con él: Prisma no detectó diferencias.
- **No hay migraciones.** El proyecto usa `prisma db push`, que alcanza para desarrollo pero no para producción (ver punto 3).
- **El seed está al día:** crea 8 categorías, 20 productos de ejemplo con emoji en lugar de foto, y el usuario admin.

### Páginas y rutas

| Ruta | Estado | Comentario |
|---|---|---|
| `/` Inicio | ✅ | Muestra categorías y destacados (o novedades si no hay destacados). |
| `/productos` | ✅ | Funciona. La búsqueda (`?q=`) existe pero **no hay buscador visible** en la web. |
| `/categoria/[slug]` | ✅ | |
| `/producto/[slug]` | ✅ | El stock es uno solo por producto, no por talle. |
| `/carrito` y carrito lateral | ✅ | Se guarda en el navegador. No limita la cantidad al stock disponible. |
| `/checkout` | 🟡 | Funciona en modo manual. Mercado Pago, sin probar. Ver problemas abajo. |
| `/checkout/exito`, `/error`, `/pendiente` | 🟡 | La página de éxito dice "Tu pago fue aprobado" sin verificarlo realmente. |
| `/cuenta/registro` | ✅ | |
| `/cuenta/verificar` | 🟡 | Verifica bien, pero **no hay forma de reenviar el mail** si expiró (24 h). |
| `/cuenta/login` | ✅ | **Falta "Olvidé mi contraseña".** |
| `/cuenta` (Mi cuenta) | ✅ | Muestra los pedidos del usuario. |
| `/envios`, `/contacto` | 🟡 | Contacto tiene datos de ejemplo ("agregá tu número" de WhatsApp). |
| `/admin` (resumen) | ✅ | Protegido: solo entra el rol admin. |
| `/admin/productos` | ✅ | Alta, edición, baja y subida de fotos. |
| `/admin/categorias` | ✅ | |
| `/admin/pedidos` | ✅ | Cambio de estado manual. No avisa al cliente por mail. |
| `/admin/newsletter` | 🟡 | Lista y exporta a CSV. **No envía campañas** ni permite darse de baja. |

---

## 3. Integraciones

### Mercado Pago
- **Checkout:** ✅ programado con "Checkout Pro". Crea la preferencia de pago y redirige a Mercado Pago.
  - Si no hay credenciales, o si Mercado Pago falla, el pedido sigue por el flujo manual.
- **Webhook de notificaciones:** ✅ existe (`/api/webhooks/mercadopago`).
  - Cuando llega un aviso, consulta el pago real en Mercado Pago y marca el pedido como pagado o cancelado. Es una buena práctica.
  - Falta validar la firma del aviso (`x-signature`). Es un riesgo menor, porque igual se consulta a Mercado Pago.
- **Credenciales:** ❌ **ninguna**. `MERCADOPAGO_ACCESS_TOKEN` y la Public Key están vacías en `.env`. El código no distingue entre credenciales de prueba y productivas: usa las que se carguen.
  - La Public Key (`NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY`) **no se usa en ningún lado**. Checkout Pro solo necesita el Access Token.
- **Para probarlo de punta a punta** hace falta una URL pública, porque Mercado Pago no puede avisarle a `localhost`. Sirve un deploy de prueba o un túnel tipo ngrok.
- **Lo que falta alrededor del pago:**
  - cuando un pago se aprueba, el stock no se descuenta y no se le manda mail al cliente;
  - el mail de "Recibimos tu pedido" sale **antes** de pagar.

### Cuentas y verificación de mail
- **Cómo funciona:**
  - la sesión es un token firmado (JWT) en una cookie segura, que dura 30 días;
  - las contraseñas se guardan cifradas con bcrypt;
  - los mails salen por SMTP (nodemailer): verificación, bienvenida al newsletter y confirmación de pedido.
- **Hoy, sin SMTP:** los mails se imprimen en la consola, y la pantalla de registro muestra directamente el link de verificación.
- **Qué falta para producción:**
  1. **Cargar un SMTP real** (Brevo, Zoho, Gmail con contraseña de aplicación, etc.) con un remitente de un dominio propio, y configurar SPF/DKIM en ese dominio para que los mails no caigan en spam.
  2. **Importante:** si la tienda se publica sin SMTP, el link de verificación aparece en pantalla. Así **cualquiera puede verificar un mail ajeno** y ver los pedidos asociados a ese mail (nombre, dirección, teléfono). Hay que bloquear ese "modo desarrollo" en producción.
  3. Agregar "Olvidé mi contraseña" (el modelo ya lo tiene previsto, pero no está programado) y "Reenviar mail de verificación".

### Base de datos: SQLite → PostgreSQL
- **Estado: 🟡 no está listo**, aunque el cambio es acotado.
- **Qué hay que hacer:**
  - cambiar `provider = "sqlite"` por `"postgresql"` en `schema.prisma`;
  - poner la URL de la base en `DATABASE_URL`;
  - **crear migraciones** (`prisma migrate`) en vez de usar `db push`.
- **La búsqueda va a cambiar de comportamiento:** en PostgreSQL distingue mayúsculas, y habría que ajustarla.
- **Los datos no viajan:** los productos cargados en SQLite no pasan solos a la base nueva. Habría que recargarlos o migrarlos con un script.

---

## 4. Pendientes y riesgos

### TODOs, código comentado y funciones vacías
- No hay `TODO`, `FIXME`, código comentado ni funciones vacías. El código está limpio.
- Lo "a medias" está en el contenido:
  - el WhatsApp de contacto es de ejemplo;
  - las fotos son emojis;
  - las descripciones de los productos dicen "Editá esta descripción…";
  - "Hasta 6 cuotas" está escrito fijo en la ficha de producto.

### Variables de entorno

| Variable | En `.env.example` | La usa el código | Comentario |
|---|---|---|---|
| `DATABASE_URL` | ✅ | ✅ | |
| `JWT_SECRET` | ✅ | ✅ | Si falta, usa una clave insegura fija **sin avisar**. |
| `NEXT_PUBLIC_SITE_URL` | ✅ | ✅ | Clave para los links de mail y las vueltas de Mercado Pago. |
| `SMTP_HOST/PORT/USER/PASS`, `MAIL_FROM` | ✅ | ✅ | |
| `MERCADOPAGO_ACCESS_TOKEN` | ✅ | ✅ | |
| `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` | ✅ | ❌ | No se usa. Se puede dejar vacía. |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | ✅ | ✅ (solo el seed) | |

No hay variables que el código use y que falten en `.env.example`.

### Problemas de seguridad y errores encontrados
- 🔴 **Verificación de mail salteable sin SMTP.** Ver el punto 3.
- 🔴 **Clave de sesión con valor por defecto.** Si en el servidor falta `JWT_SECRET`, cualquiera que conozca el código puede fabricarse una sesión de admin. La aplicación debería negarse a arrancar sin esa clave.
- 🟠 **El stock no se controla.**
  - Se pueden comprar más unidades que las disponibles, y también productos ocultos.
  - El stock nunca se descuenta.
  - No se valida que el talle elegido exista.
- 🟠 **Error del checkout con productos borrados.** Si un producto del carrito se borró, el pedido da error 500 en lugar del mensaje amable que ya está programado (el `throw` ocurre antes de la validación).
- 🟠 **Contraseña de admin por defecto.** `Duo2026!` figura en el README y en `.env.example`, y el seed la imprime en la consola. Hay que cambiarla antes de publicar.
- 🟡 **Sin límite de intentos** en login, registro y newsletter: queda expuesto a robots y a fuerza bruta.
- 🟡 **El menú de categorías del encabezado queda "congelado" en producción.** `/api/categories` se genera una sola vez al compilar (figura como estática en el build). Las categorías nuevas no van a aparecer en el menú hasta recompilar.
- 🟡 **Webhook de Mercado Pago sin validación de firma.** El riesgo es bajo.
- ✅ **El panel admin está bien protegido.** Las páginas redirigen si no sos admin, y cada endpoint del admin vuelve a chequear el rol.
- ✅ **No hay credenciales escritas en el código** y el `.env` está excluido de git.

### Qué falta para el deploy
1. **Base PostgreSQL** (Neon, Supabase, Railway, etc.) y migraciones.
2. **Imágenes en un servicio externo** (Cloudinary, Vercel Blob, S3).
   - Hoy se guardan en `public/uploads`. En Vercel se pierden, y aun en un servidor propio Next.js **no sirve archivos agregados a `public/` después de compilar**.
3. **Variables de entorno de producción:** dominio real en `NEXT_PUBLIC_SITE_URL`, `JWT_SECRET` largo y aleatorio, SMTP y Mercado Pago.
4. **Dominio propio con HTTPS.** Lo necesitan Mercado Pago, la cookie segura y los mails.
5. **Corregir los puntos 🔴 y 🟠** de la lista anterior.
6. **Prueba completa con Mercado Pago en modo prueba** sobre el deploy, antes de pasar a credenciales productivas.

---

## 5. Próximos pasos (de más urgente a menos)

| # | Paso | Esfuerzo |
|---|---|---|
| 1 | **Seguridad mínima:** que la app no arranque sin `JWT_SECRET`, ocultar el link de verificación en producción, que el seed no imprima la contraseña, y cambiar la contraseña del admin. | Chico |
| 2 | **Arreglar el checkout:** error con productos borrados, rechazar productos ocultos o sin stock, validar el talle y la cantidad. | Chico |
| 3 | **Corregir el menú de categorías estático** (`/api/categories`). | Chico |
| 4 | **Pasar a PostgreSQL** con migraciones y ajustar la búsqueda. | Medio |
| 5 | **Mover las imágenes** a un almacenamiento externo. | Medio |
| 6 | **Deploy de prueba** (por ejemplo, Vercel + Neon) con dominio y variables de entorno. | Medio |
| 7 | **Mercado Pago de punta a punta en modo prueba:** cargar credenciales de test, probar pago aprobado, rechazado y pendiente, y validar la firma del webhook. | Medio |
| 8 | **Después del pago:** descontar stock, mandar el mail de "pago confirmado" (y no antes), y que la página de éxito muestre el estado real del pedido. | Medio |
| 9 | **Mails reales:** SMTP, dominio y SPF/DKIM. Sumar "Olvidé mi contraseña" y "Reenviar verificación". | Medio |
| 10 | **Contenido real:** fotos, descripciones, WhatsApp e Instagram de contacto, cuotas reales. | Medio (no técnico) |
| 11 | **Requisitos legales** de comercio electrónico en Argentina: términos y condiciones, política de privacidad y "Botón de arrepentimiento". Conviene confirmarlos con un contador o abogado. | Chico |
| 12 | **Límite de intentos** en login, registro y newsletter. | Chico |
| 13 | **Mejoras de tienda:** buscador visible, mails al cambiar el estado del pedido, configurar ESLint, sitemap y robots para SEO. | Chico a medio |
| 14 | **Funciones nuevas:** stock por talle, cálculo automático del costo de envío (Correo Argentino / Andreani), envío de campañas del newsletter y baja de suscripción. | Grande |
