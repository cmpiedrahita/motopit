// Utilidades de validación compartidas por todas las historias.
// Convierten los errores de Zod al formato que usa la API: { campo: mensaje }.
import { z } from "zod";

export type Errores = Record<string, string>;
export type Resultado<T> = { ok: true; datos: T } | { ok: false; errores: Errores };

export function aErrores(error: z.ZodError): Errores {
  const errores: Errores = {};
  for (const issue of error.issues) {
    const campo = String(issue.path[0] ?? "general");
    // Solo el primer error de cada campo: es el que se muestra debajo del input.
    if (!errores[campo]) errores[campo] = issue.message;
  }
  return errores;
}

export function validar<S extends z.ZodType>(esquema: S, datos: unknown): Resultado<z.output<S>> {
  const r = esquema.safeParse(datos);
  return r.success ? { ok: true, datos: r.data } : { ok: false, errores: aErrores(r.error) };
}

/** Número entero que puede llegar como texto desde un formulario. Vacío = error. */
export function entero(mensajeVacio: string, mensajeInvalido = "Debe ser un número entero") {
  return z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : typeof v === "string" ? Number(v) : v),
    z
      .number({ error: (issue) => (issue.input === undefined ? mensajeVacio : mensajeInvalido) })
      .int(mensajeInvalido),
  );
}

/** Texto obligatorio, sin espacios sobrantes. */
export function texto(mensajeVacio: string) {
  return z.string({ error: mensajeVacio }).trim().min(1, mensajeVacio);
}
