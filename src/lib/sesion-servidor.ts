// HU-18: sesión en cookies firmadas (solo servidor). Hay una cookie por rol, así en la demo
// se puede tener abierto al domiciliario y al mecánico en el mismo navegador.
// Las cookies son httpOnly: el JavaScript de la página no las puede leer ni modificar.
import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { crearToken, DURACION_SESION_MS, leerToken, type Rol } from "./auth";
import { responderErrores } from "./api";

const COOKIE: Record<Rol, string> = {
  domiciliario: "motopit_domiciliario",
  mecanico: "motopit_mecanico",
};

/**
 * Clave para firmar las sesiones. Lo ideal es definir SESSION_SECRET (ver .env.example).
 * Si no existe, se deriva de DATABASE_URL, que también es secreta, para que el despliegue no falle.
 */
function secreto(): string {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  if (process.env.DATABASE_URL) return createHash("sha256").update(`motopit-sesion:${process.env.DATABASE_URL}`).digest("hex");
  throw new Error("Falta la variable SESSION_SECRET (ver .env.example)");
}

/** id del usuario con sesión activa en ese rol, o null. */
export async function usuarioEnSesion(rol: Rol): Promise<string | null> {
  const token = (await cookies()).get(COOKIE[rol])?.value;
  const datos = leerToken(token, secreto());
  return datos?.rol === rol ? datos.id : null;
}

export async function iniciarSesion(rol: Rol, id: string) {
  (await cookies()).set(COOKIE[rol], crearToken({ rol, id }, secreto()), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DURACION_SESION_MS / 1000,
  });
}

export async function cerrarSesion(rol: Rol) {
  (await cookies()).delete(COOKIE[rol]);
}

/** 401: no hay sesión. */
export function sinSesion() {
  return responderErrores({ general: "Inicia sesión para continuar" }, 401);
}

/** 403: hay sesión, pero el recurso es de otro usuario. */
export function sinPermiso() {
  return responderErrores({ general: "No tienes permiso para hacer esto" }, 403);
}
