import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const COOKIE_NAME = "duo_session";

/**
 * En producción la clave es obligatoria: sin ella cualquiera podría firmar
 * una sesión de admin. En desarrollo se usa una clave fija para no trabar.
 */
function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("Falta JWT_SECRET en las variables de entorno.");
  }
  return "insecure-dev-secret";
}

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signToken(user: SessionUser) {
  return jwt.sign(user, getJwtSecret(), { expiresIn: "30d" });
}

export function verifyToken(token: string): SessionUser | null {
  const secret = getJwtSecret();
  try {
    return jwt.verify(token, secret) as SessionUser;
  } catch {
    return null;
  }
}

export function setSessionCookie(token: string) {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearSessionCookie() {
  cookies().set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
}

export function getSessionFromCookie(): SessionUser | null {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

/** Devuelve el usuario actual (fresco desde la base) o null. */
export async function getCurrentUser() {
  const session = getSessionFromCookie();
  if (!session) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { id: true, email: true, name: true, role: true, emailVerified: true },
  });
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return null;
  return user;
}
