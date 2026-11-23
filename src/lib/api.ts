// Ayudas para las rutas de la API: respuestas de error con el formato
// { errores: { campo: mensaje } } y lectura segura del cuerpo JSON.
import { NextResponse } from "next/server";
import { z } from "zod";
import { logger } from "./logger";
import type { Errores } from "./validacion";

export function responderErrores(errores: Errores, status: number) {
  return NextResponse.json({ errores }, { status });
}

export function noEncontrado(mensaje: string) {
  return responderErrores({ general: mensaje }, 404);
}

/** Lee el cuerpo como JSON. Si no es JSON válido devuelve {} y la validación reporta los campos. */
export async function leerCuerpo(req: Request): Promise<Record<string, unknown>> {
  try {
    const cuerpo = await req.json();
    return cuerpo && typeof cuerpo === "object" ? cuerpo : {};
  } catch {
    return {};
  }
}

export function esUuid(valor: unknown): valor is string {
  return z.uuid().safeParse(valor).success;
}

/** true si Postgres rechazó la operación por una restricción UNIQUE (código 23505). */
export function esDuplicado(error: unknown): boolean {
  const e = error as { code?: string; cause?: { code?: string } };
  return e?.code === "23505" || e?.cause?.code === "23505";
}

export function errorInterno(error: unknown, contexto: string) {
  logger.error(`${contexto}: error inesperado`, { error: error instanceof Error ? error.message : String(error) });
  return responderErrores({ general: "Ocurrió un error inesperado. Intenta de nuevo en un momento." }, 500);
}
