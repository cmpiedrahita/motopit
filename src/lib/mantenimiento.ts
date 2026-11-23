// HU-07 recordatorio de aceite, HU-08 actualizar km y HU-09 historial.
import { z } from "zod";
import { entero, validar, type Resultado } from "./validacion";

/** Cada cuántos km toca cambio de aceite. */
export const INTERVALO_ACEITE_KM = 2000;
/** Desde cuántos km antes del cambio se muestra el aviso. */
export const AVISO_ACEITE_KM = 300;

export type Recordatorio = {
  proximoCambioKm: number;
  faltanKm: number;
  mostrarAviso: boolean;
  vencido: boolean;
  /** Avance entre 0 y 1 desde el último cambio, para la barra de progreso. */
  progreso: number;
};

export function recordatorioAceite(kmActual: number, kmUltimoAceite: number): Recordatorio {
  const proximoCambioKm = kmUltimoAceite + INTERVALO_ACEITE_KM;
  const faltanKm = proximoCambioKm - kmActual;
  const progreso = Math.min(1, Math.max(0, (kmActual - kmUltimoAceite) / INTERVALO_ACEITE_KM));
  return {
    proximoCambioKm,
    faltanKm,
    mostrarAviso: faltanKm <= AVISO_ACEITE_KM,
    vencido: faltanKm <= 0,
    progreso,
  };
}

/** HU-08: el nuevo km es obligatorio y no puede ser menor al actual. */
export function validarNuevoKm(datos: unknown, kmActual: number): Resultado<{ km: number }> {
  const esquema = z.object({
    km: entero("Escribe el kilometraje").pipe(
      z.number().min(kmActual, `No puede ser menor al kilometraje actual (${kmActual})`),
    ),
  });
  return validar(esquema, datos);
}

/**
 * Cómo queda la moto al cerrar una visita (HU-06): toma el km del cierre y,
 * si fue cambio de aceite, reinicia el contador del recordatorio (HU-07).
 */
export function motoTrasCierre(kmCierre: number, servicio: string, kmUltimoAceite: number) {
  return {
    kmActual: kmCierre,
    kmUltimoAceite: servicio === "CAMBIO_ACEITE" ? kmCierre : kmUltimoAceite,
  };
}

/** HU-09: solo visitas completadas, de la más reciente a la más antigua. */
export function historialDeMantenimiento<T extends { estado: string; fecha: Date | string }>(visitas: T[]): T[] {
  return visitas
    .filter((v) => v.estado === "COMPLETADA")
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
}
