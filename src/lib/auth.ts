// HU-18: ingreso con celular y PIN. Reglas puras (sin base de datos ni cookies) para poder probarlas:
// - el PIN se guarda cifrado con scrypt y una sal aleatoria, nunca en texto plano;
// - la sesión es un token firmado con HMAC: si alguien lo modifica, la firma ya no coincide;
// - tras varios intentos fallidos la cuenta se bloquea un rato (un PIN de 4 dígitos se adivina fácil).
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { CELULAR, MENSAJE_PIN, normalizarCelular, PIN } from "./registro";
import { validar } from "./validacion";

export type Rol = "domiciliario" | "mecanico";
export type DatosSesion = { rol: Rol; id: string; exp: number };

export const DURACION_SESION_MS = 30 * 24 * 60 * 60 * 1000; // 30 días
export const MAX_INTENTOS = 5;
export const BLOQUEO_MS = 15 * 60 * 1000; // 15 minutos
export const MENSAJE_CREDENCIALES = "Celular o PIN incorrectos";

// ─── PIN ────────────────────────────────────────────────────────────────

export function cifrarPin(pin: string): string {
  const sal = randomBytes(16).toString("hex");
  const hash = scryptSync(pin, sal, 32).toString("hex");
  return `scrypt$${sal}$${hash}`;
}

/** Compara en tiempo constante para no dar pistas por lo que tarda la respuesta. */
export function verificarPin(pin: string, guardado: string | null | undefined): boolean {
  if (!guardado) return false;
  const [algoritmo, sal, hash] = guardado.split("$");
  if (algoritmo !== "scrypt" || !sal || !hash) return false;
  const calculado = scryptSync(pin, sal, 32);
  const esperado = Buffer.from(hash, "hex");
  return esperado.length === calculado.length && timingSafeEqual(calculado, esperado);
}

// ─── Token de sesión ────────────────────────────────────────────────────

function firmar(cuerpo: string, secreto: string) {
  return createHmac("sha256", secreto).update(cuerpo).digest();
}

export function crearToken(datos: { rol: Rol; id: string }, secreto: string, ahora = Date.now()): string {
  const cuerpo = Buffer.from(JSON.stringify({ ...datos, exp: ahora + DURACION_SESION_MS })).toString("base64url");
  return `${cuerpo}.${firmar(cuerpo, secreto).toString("base64url")}`;
}

/** Devuelve los datos si el token es auténtico y no ha vencido; si no, null. */
export function leerToken(token: string | undefined, secreto: string, ahora = Date.now()): DatosSesion | null {
  if (!token) return null;
  const [cuerpo, firma] = token.split(".");
  if (!cuerpo || !firma) return null;
  const recibida = Buffer.from(firma, "base64url");
  const esperada = firmar(cuerpo, secreto);
  if (recibida.length !== esperada.length || !timingSafeEqual(recibida, esperada)) return null;
  try {
    const datos = JSON.parse(Buffer.from(cuerpo, "base64url").toString("utf8"));
    if (datos.rol !== "domiciliario" && datos.rol !== "mecanico") return null;
    if (typeof datos.id !== "string" || typeof datos.exp !== "number" || datos.exp < ahora) return null;
    return datos as DatosSesion;
  } catch {
    return null;
  }
}

// ─── Bloqueo por intentos fallidos ──────────────────────────────────────

export function estaBloqueado(bloqueadoHasta: Date | null, ahora = new Date()): boolean {
  return !!bloqueadoHasta && bloqueadoHasta.getTime() > ahora.getTime();
}

/** Suma un intento fallido; al llegar al máximo bloquea la cuenta y reinicia el contador. */
export function trasIntentoFallido(intentosFallidos: number, ahora = new Date()) {
  const intentos = intentosFallidos + 1;
  return intentos >= MAX_INTENTOS
    ? { intentosFallidos: 0, bloqueadoHasta: new Date(ahora.getTime() + BLOQUEO_MS) }
    : { intentosFallidos: intentos, bloqueadoHasta: null };
}

export const TRAS_INGRESO_EXITOSO = { intentosFallidos: 0, bloqueadoHasta: null };

// ─── Datos del formulario de ingreso ────────────────────────────────────

const esquemaIngreso = z.object({
  rol: z.enum(["domiciliario", "mecanico"], { error: "Rol inválido" }),
  celular: z.preprocess(
    (v) => (typeof v === "string" ? normalizarCelular(v) : v),
    z.string({ error: "Escribe tu celular" }).regex(CELULAR, "El celular debe tener 10 dígitos y empezar por 3"),
  ),
  pin: z.string({ error: "Escribe tu PIN" }).regex(PIN, MENSAJE_PIN),
});

export function validarIngreso(datos: unknown) {
  return validar(esquemaIngreso, datos);
}
