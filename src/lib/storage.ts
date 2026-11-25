import { createHash } from "crypto";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

/**
 * Guardado de imágenes de productos.
 *
 * - Con CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET definidas,
 *   las fotos se suben a Cloudinary (almacenamiento persistente: no se pierden en cada deploy).
 * - Sin esas variables, en desarrollo se guardan en public/uploads como antes.
 * - En producción las variables son obligatorias: public/uploads se borra en cada deploy
 *   y Next no sirve archivos agregados después de compilar.
 */

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;
const FOLDER = process.env.CLOUDINARY_FOLDER || "duo-indumentaria/productos";

export function cloudinaryConfigurado() {
  return Boolean(CLOUD_NAME && API_KEY && API_SECRET);
}

async function subirACloudinary(bytes: Buffer, mimeType: string): Promise<string> {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  // Firma: parámetros ordenados alfabéticamente + secreto, en SHA-1 (según la doc de Cloudinary)
  const firma = createHash("sha1")
    .update(`folder=${FOLDER}&timestamp=${timestamp}${API_SECRET}`)
    .digest("hex");

  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(bytes)], { type: mimeType }));
  form.append("api_key", API_KEY!);
  form.append("timestamp", timestamp);
  form.append("folder", FOLDER);
  form.append("signature", firma);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: form,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.secure_url) {
    console.error("Error al subir a Cloudinary:", data?.error?.message || res.status);
    throw new Error("No se pudo subir la imagen. Probá de nuevo en unos minutos.");
  }
  return data.secure_url as string;
}

async function guardarLocal(bytes: Buffer, mimeType: string): Promise<string> {
  const ext = mimeType.split("/")[1].replace("jpeg", "jpg");
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), bytes);
  return `/uploads/${name}`;
}

/** Guarda la imagen y devuelve la URL para guardar en el producto. */
export async function guardarImagen(bytes: Buffer, mimeType: string): Promise<string> {
  if (cloudinaryConfigurado()) return subirACloudinary(bytes, mimeType);
  if (process.env.NODE_ENV === "production") {
    console.error("Faltan las variables CLOUDINARY_* en producción.");
    throw new Error("La subida de imágenes no está configurada. Avisá al administrador del sitio.");
  }
  return guardarLocal(bytes, mimeType);
}
