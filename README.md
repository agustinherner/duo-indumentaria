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

Necesitás tener **Node.js 18+** instalado.

```bash
# 1. Instalar dependencias
npm install

# 2. Crear el archivo de configuración
cp .env.example .env
#    (en Windows: copy .env.example .env)
#    Completá JWT_SECRET (obligatoria: sin ella la app no arranca) y ADMIN_PASSWORD.

# 3. Crear la base de datos y cargar datos de ejemplo
npm run setup

# 4. Levantar el servidor de desarrollo
npm run dev
```

Abrí **http://localhost:3000** en el navegador. ¡Listo!

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
  lib/               → prisma, auth, mail, mercadopago, utils
prisma/
  schema.prisma      → modelo de datos
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
| `npm run setup` | Crear la base + cargar datos de ejemplo |
| `npm run db:seed` | Volver a cargar los datos de ejemplo |
| `npm run db:studio` | Abrir Prisma Studio (ver/editar la base visualmente) |

## 📦 Pasar a producción

- **Base de datos:** el proyecto usa SQLite (archivo local) por simplicidad. Para producción
  se recomienda PostgreSQL: cambiá `provider` a `postgresql` en `prisma/schema.prisma` y poné
  la URL de tu base en `DATABASE_URL`.
- **Hosting:** funciona en Vercel, Railway, Render, un VPS, etc. Recordá setear todas las
  variables de entorno y cambiar `NEXT_PUBLIC_SITE_URL` por tu dominio real.
- **Seguridad:** cambiá `JWT_SECRET` por una clave larga y aleatoria, y la contraseña del admin.

---

Tienda: 25 de Mayo 466, Santa Rosa (La Pampa) · Lun a Sáb 9–13 y 16:30–21 hs · Envíos a todo el país.
