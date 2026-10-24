> **⚠️ BORRADOR — revisar antes de pasarlo a `02-bitacora.md`.**
> El archivo `docs/practica/02-bitacora.md` no está en el repositorio, así que este borrador
> **no copia el formato de las entradas anteriores**. Los 6 títulos de abajo son provisionales:
> reemplazalos por los 6 pasos que usás en la bitácora y mové el contenido donde corresponda.

## Jornada 3 (paneo del estado)

*21/10/2026 – 24/10/2026 · rama `fix/semana-21-26-oct`*

### 1. Objetivo

Relevar el estado real de la tienda antes de pensar en el deploy, y cerrar los problemas
urgentes que salieran del relevamiento: seguridad mínima, checkout/stock y el menú de
categorías congelado.

### 2. Punto de partida (paneo)

- Se hizo un relevamiento de solo lectura sobre el commit `442fadd` (primer commit de la
  tienda). El resultado quedó en `PANEO-ESTADO.md`, que se sumó al repo en el commit `aa2b982`.
- Conclusión del paneo: la tienda está completa como producto base y compila, pero **no está
  lista para publicar**. Los puntos más urgentes:
  - 🔴 la sesión usaba una clave fija si faltaba `JWT_SECRET`;
  - 🔴 sin SMTP, el link de verificación de mail aparecía en pantalla (en producción
    permitiría verificar mails ajenos);
  - 🟠 contraseña de admin por defecto en el README, en `.env.example` y en la consola del seed;
  - 🟠 el stock no se controlaba y el checkout daba error 500 con productos borrados;
  - 🟡 `/api/categories` salía como estática en el build.

### 3. Qué se hizo

| Tarea | Commit(s) | Resultado |
|---|---|---|
| 1. Seguridad mínima | `aa2b982` + `f4d5007` | Sin `JWT_SECRET` la app no compila ni arranca (error claro). Sin clave fija. El link de verificación solo se muestra en desarrollo. El seed no imprime la contraseña. Se sacó la contraseña del admin del README y de `.env.example`. |
| 2. Checkout y stock | `aa2b982` + `4a7650f` | El checkout devuelve el mensaje amable (400) en lugar del 500 con productos borrados. Rechaza productos ocultos, sin stock, talles inexistentes y cantidades mayores al stock. El carrito también limita la cantidad al stock. |
| 3. Menú de categorías | `aa2b982` | `/api/categories` es dinámica (`force-dynamic`). |

### 4. Evidencia

- `PANEO-ESTADO.md` (relevamiento sobre `442fadd`).
- Build: `/api/categories` figura como `○` (estática) con el código de `442fadd` y como
  `ƒ` (dinámica) con el actual. En el servidor de producción, una categoría creada después del
  build aparece en `/api/categories` sin recompilar.
- `next build`, `next start` y `next dev` sin `JWT_SECRET` cortan con:
  `Error: Falta JWT_SECRET. Definila en .env…`.
- Registro: en producción la respuesta no trae `devMailLink`; en desarrollo sí.
- Checkout (llamadas directas a `/api/checkout`): producto borrado, oculto, sin stock, talle
  inexistente, cantidad mayor al stock y stock repartido entre talles → **400** con mensaje claro.
  Un pedido válido → OK.
- Carrito (prueba en el navegador con stock 3): no deja pasar de 3 unidades sumando talles.
- `npm run build` OK después de cada tarea. `npx tsc --noEmit` OK.

### 5. Problemas y decisiones

- **Lint:** no está configurado. Configurarlo implica instalar ESLint, así que quedó pendiente
  hasta decidirlo.
- **Migraciones:** no hay migraciones de Prisma. Se usó `prisma db push` + seed sobre una base
  SQLite de prueba.
- **`npm audit`:** reporta 11 vulnerabilidades (incluida Next.js). No se tocaron:
  `npm audit fix --force` rompe el proyecto.
- **El seed no sirve para la base real:** si se vuelve a correr, recrea los productos de ejemplo
  borrados y restablece las categorías. Para cambiar la contraseña del admin hay que hacerlo a
  mano en la base.
- **La contraseña vieja del admin sigue en el historial de git** (`442fadd`). Por eso hay que
  cambiarla en la base real, no alcanza con sacarla del README.

### 6. Próximos pasos

1. Cambiar la contraseña real del admin y cargar `JWT_SECRET` en el servidor.
2. Descontar stock cuando se confirma el pago, y hacer la validación y la creación del pedido en
   una sola transacción para evitar sobreventa.
3. Pasar a PostgreSQL con migraciones (paso 4 del paneo).
4. Configurar SMTP antes de publicar: en producción sin SMTP nadie puede verificar su cuenta.
5. Decidir si se configura ESLint y cómo encarar las vulnerabilidades de `npm audit`.
