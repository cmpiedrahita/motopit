// HU-13: perfil verificado del mecánico y calificación de 1 a 5.
import { z } from "zod";
import { entero, validar } from "./validacion";

const esquemaCalificacion = z.object({
  domiciliarioId: z.uuid("Falta el domiciliario"),
  calificacion: entero("Elige de 1 a 5 estrellas", "La calificación debe ser de 1 a 5 estrellas").pipe(
    z.number().min(1, "La calificación debe ser de 1 a 5 estrellas").max(5, "La calificación debe ser de 1 a 5 estrellas"),
  ),
});

export function validarCalificacion(datos: unknown) {
  return validar(esquemaCalificacion, datos);
}

/** Solo se califica una visita completada y una sola vez. */
export function puedeCalificar(visita: { estado: string; calificacion: number | null }): boolean {
  return visita.estado === "COMPLETADA" && visita.calificacion === null;
}

export type Resumen = { promedio: number | null; total: number };

/** Promedio de calificaciones por mecánico, redondeado a 1 decimal. */
export function resumenCalificaciones(
  filas: { mecanicoId: string | null; calificacion: number | null }[],
): Map<string, Resumen> {
  const sumas = new Map<string, { suma: number; total: number }>();
  for (const { mecanicoId, calificacion } of filas) {
    if (!mecanicoId || calificacion === null) continue;
    const actual = sumas.get(mecanicoId) ?? { suma: 0, total: 0 };
    sumas.set(mecanicoId, { suma: actual.suma + calificacion, total: actual.total + 1 });
  }
  const resumen = new Map<string, Resumen>();
  for (const [id, { suma, total }] of sumas) {
    resumen.set(id, { promedio: Math.round((suma / total) * 10) / 10, total });
  }
  return resumen;
}

export function resumenDe(resumen: Map<string, Resumen>, mecanicoId: string | null): Resumen {
  return (mecanicoId && resumen.get(mecanicoId)) || { promedio: null, total: 0 };
}
