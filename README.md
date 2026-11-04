# Duo Indumentaria — Tienda online

Tienda de ropa online construida con **Next.js 14**, **Prisma** y **Tailwind CSS**.
Incluye catálogo por categorías, carrito, cuentas de usuario con verificación de mail,
newsletter, checkout con **Mercado Pago** y un **panel de administración** completo.

## ✨ Funcionalidades

- 🛍️ Catálogo con 8 categorías (Buzos, Remeras, Camperas, Boxer, Jeans, Joggins, Sueter, Chalecos)
- 🛒 Carrito de compras (persiste en el navegador)
- 👤 Registro de usuarios + verificación de email
- 💳 Checkout con Mercado Pago (o flujo manual si no está configurado)
- ✉️ Newsletter con exportación a CSV
- 🚚 Páginas de envíos, contacto y horarios del local
- 🔐 Panel de administración: alta/edición/baja de productos y categorías, precios, stock,
  subida de imágenes, gestión de pedidos y suscriptores
- 📱 Diseño responsive inspirado en tiendas de indumentaria

## 🚀 Puesta en marcha (paso a paso)

Necesitás tener **Node.js 18+** y **PostgreSQL 14+** instalados.

### 1. Instalar PostgreSQL y crear la base local

- **Windows / macOS:** descargá el instalador desde https://www.postgresql.org/download/
  (en macOS también sirve [Postgres.app](https://postgresapp.com/)). Durante la instalación
  elegís la contraseña del usuario `postgres`; anotala.
- **Linux (Debian/Ubuntu):** `sudo apt install postgresql`
- **Con Docker (cualquier sistema):**
  `docker run --name duo-postgres -e POSTGRES_USER=duo -e POSTGRES_PASSWORD=tu_clave -e POSTGRES_DB=duo_indumentaria -p 5432:5432 -d postgres:16`
  (con esto ya tenés usuario y base: saltá al paso 2).

Después creá un usuario y una base para la tienda. Abrí `psql` como `postgres`
(en Windows: "SQL Shell (psql)" desde el menú Inicio; en Linux: `sudo -u postgres psql`) y corré:

```sql
CREATE USER duo WITH PASSWORD 'tu_clave' CREATEDB;
CREATE DATABASE duo_indumentaria OWNER duo;
```

> `CREATEDB` hace falta para `prisma migrate dev`, que usa una base temporal ("shadow") para
> comparar el esquema. También podés hacer lo mismo desde pgAdmin.

### 2. Configurar y arrancar

```bash
# Instalar dependencias
npm install

# Crear el archivo de configuración
cp .env.example .env
#   (en Windows: copy .env.example .env)
#   Completá:
#   - DATABASE_URL con tu usuario y clave, por ejemplo:
#       postgresql://duo:tu_clave@localhost:5432/duo_indumentaria?schema=public
#   - JWT_SECRET (obligatoria: sin ella la app no arranca)
#   - ADMIN_PASSWORD

# Crear las tablas (aplica las migraciones) y cargar datos de ejemplo
npm run setup

# Levantar el servidor de desarrollo
npm run dev
```

Abrí **http://localhost:3000** en el navegador. ¡Listo!

### Migraciones de la base

El esquema está en `prisma/schema.prisma` y los cambios se guardan como migraciones en
`prisma/migrations/` (van en git).

- **Cambiaste el esquema** → `npm run db:migrate -- --name descripcion_del_cambio`
  (crea la migración nueva y la aplica en tu base local).
- **Aplicar migraciones existentes** (después de un `git pull`, o en producción) →
  `npm run db:deploy`. No crea migraciones ni borra datos.
- No uses `prisma db push`: cambia la base sin dejar migración.

## 🔑 Acceso al panel de administración

El seed crea un usuario administrador con los datos de `.env`:

- **URL:** http://localhost:3000/admin
- **Email:** el de `ADMIN_EMAIL` (por defecto `admin@duoindumentaria.com`)
- **Contraseña:** la de `ADMIN_PASSWORD` (obligatoria, mínimo 8 caracteres)

Si cambiás la contraseña en `.env`, corré `npm run db:seed` para actualizarla en la base.
Ojo: el seed también vuelve a crear los productos de ejemplo que hayas borrado y restablece
nombres y emojis de las categorías, así que no lo uses sobre la base real de la tienda.

Desde el admin podés crear/editar categorías, productos, precios, stock y subir imágenes.
Cada producto muestra un **emoji** como placeholder hasta que le cargues una foto real.

## 📧 Envío de mails (verificación y newsletter)

Por defecto, **sin configurar SMTP**, los mails NO se envían: en su lugar se imprimen en la
consola del servidor y, al registrarte, la web te muestra directamente el link de verificación
(modo desarrollo). Así podés probar todo sin configurar nada.

Para enviar mails reales, completá en `.env` los datos de tu proveedor SMTP (Gmail, Zoho,
Brevo/Sendinblue, etc.):

```
SMTP_HOST="smtp.tu-proveedor.com"
SMTP_PORT="587"
SMTP_USER="tu-usuario"
SMTP_PASS="tu-contraseña"
MAIL_FROM="Duo Indumentaria <no-reply@tudominio.com>"
```

> Con Gmail necesitás una "contraseña de aplicación" (no tu contraseña normal).

## 💳 Configurar Mercado Pago

1. Creá una cuenta de desarrollador en https://www.mercadopago.com.ar/developers
2. Obtené tu **Access Token** y **Public Key**.
3. Cargalos en `.env`:

```
MERCADOPAGO_ACCESS_TOKEN="APP_USR-...."
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY="APP_USR-...."
```

Mientras no configures Mercado Pago, el checkout usa un **flujo manual**: se registra el pedido
y se te avisa para coordinar el pago por fuera. Cuando cargues las credenciales, el checkout
redirige automáticamente a la pasarela de pago de Mercado Pago.

> Para que Mercado Pago te notifique los pagos aprobados en producción, tu sitio debe ser
> accesible por internet (el webhook es `/api/webhooks/mercadopago`).

## 🗂️ Estructura del proyecto

```
src/
  app/
    (páginas públicas: home, productos, categoría, producto, carrito, checkout, cuenta, envíos, contacto)
    admin/           → panel de administración
    api/             → endpoints (auth, products, categories, newsletter, checkout, admin, webhooks)
  components/        → Header, Footer, CartDrawer, ProductCard, etc.
  context/           → CartContext (estado del carrito)
  lib/               → prisma, auth, mail, mercadopago, rateLimit, utils
prisma/
  schema.prisma      → modelo de datos
  migrations/        → migraciones de la base (PostgreSQL)
  seed.ts            → categorías + productos de ejemplo + admin
public/
  logo.jpeg          → logo de Duo Indumentaria
  uploads/           → imágenes subidas desde el admin
```

## 🛠️ Comandos útiles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compilar para producción |
| `npm run start` | Servir la versión de producción |
| `npm run lint` | Revisar el código con ESLint |
| `npm run setup` | Aplicar migraciones + cargar datos de ejemplo |
| `npm run db:migrate` | Crear y aplicar una migración nueva (desarrollo) |
| `npm run db:deploy` | Aplicar migraciones pendientes (producción / después de un pull) |
| `npm run db:seed` | Volver a cargar los datos de ejemplo |
| `npm run db:studio` | Abrir Prisma Studio (ver/editar la base visualmente) |

## 📦 Pasar a producción

- **Base de datos:** PostgreSQL. Poné la URL de la base de producción en `DATABASE_URL` y
  corré `npm run db:deploy` en cada deploy, antes de arrancar la app.
- **Límite de intentos:** login, registro y newsletter tienen límite por IP (y por email en
  el login). Los contadores viven en memoria: con varias instancias o en serverless hay que
  pasarlos a Redis/Upstash (ver `src/lib/rateLimit.ts`).
- **Hosting:** funciona en Vercel, Railway, Render, un VPS, etc. Recordá setear todas las
  variables de entorno y cambiar `NEXT_PUBLIC_SITE_URL` por tu dominio real.
- **Seguridad:** cambiá `JWT_SECRET` por una clave larga y aleatoria, y la contraseña del admin.

---

Tienda: 25 de Mayo 466, Santa Rosa (La Pampa) · Lun a Sáb 9–13 y 16:30–21 hs · Envíos a todo el país.
