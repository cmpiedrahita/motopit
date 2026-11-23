// Llamadas a la API desde las pantallas. Devuelve siempre un resultado (nunca lanza),
// con los errores en el mismo formato { campo: mensaje } que responde la API.
import type { Errores } from "./validacion";

export type RespuestaApi<T> = { ok: true; status: number; datos: T } | { ok: false; status: number; errores: Errores };

export async function pedir<T>(url: string, opciones: { metodo?: string; cuerpo?: unknown } = {}): Promise<RespuestaApi<T>> {
  try {
    const res = await fetch(url, {
      method: opciones.metodo ?? "GET",
      headers: opciones.cuerpo === undefined ? undefined : { "Content-Type": "application/json" },
      body: opciones.cuerpo === undefined ? undefined : JSON.stringify(opciones.cuerpo),
      cache: "no-store",
    });
    const datos = await res.json().catch(() => ({}));
    if (res.ok) return { ok: true, status: res.status, datos: datos as T };
    return {
      ok: false,
      status: res.status,
      errores: (datos as { errores?: Errores }).errores ?? { general: "Ocurrió un error. Intenta de nuevo." },
    };
  } catch {
    return { ok: false, status: 0, errores: { general: "No hay conexión. Revisa tu internet e intenta de nuevo." } };
  }
}
