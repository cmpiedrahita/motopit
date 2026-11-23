// Ciclo de vida de una visita. Todas las historias que cambian el estado
// (HU-03 agendar, HU-04 aceptar, HU-06 cerrar) deben pasar por aquí.
import { z } from "zod";
import { entero, texto, validar, type Resultado } from "./validacion";

export type EstadoVisita = "PENDIENTE" | "ASIGNADA" | "COMPLETADA" | "CANCELADA";

const transicionesValidas: Record<EstadoVisita, EstadoVisita[]> = {
  PENDIENTE: ["ASIGNADA", "CANCELADA"],
  ASIGNADA: ["COMPLETADA", "CANCELADA"],
  COMPLETADA: [],
  CANCELADA: [],
};

export function puedeCambiarEstado(actual: EstadoVisita, nuevo: EstadoVisita): boolean {
  return transicionesValidas[actual].includes(nuevo);
}

export function cambiarEstado(actual: EstadoVisita, nuevo: EstadoVisita): EstadoVisita {
  if (!puedeCambiarEstado(actual, nuevo)) {
    throw new Error(`No se puede pasar una visita de ${actual} a ${nuevo}`);
  }
  return nuevo;
}

// ─── HU-04: el mecánico ve y acepta visitas pendientes ─────────────────────

type VisitaConMecanico = { estado: EstadoVisita; mecanicoId: string | null };

/** Acepta una visita para un mecánico. Falla si ya no está PENDIENTE. */
export function aceptarVisita(visita: VisitaConMecanico, mecanicoId: string) {
  return { estado: cambiarEstado(visita.estado, "ASIGNADA"), mecanicoId };
}

/**
 * Separa lo que ve un mecánico: las pendientes (de todos) y las asignadas a él.
 * Una visita asignada a otro mecánico no aparece.
 */
export function clasificarParaMecanico<T extends VisitaConMecanico>(visitas: T[], mecanicoId: string) {
  return {
    pendientes: visitas.filter((v) => v.estado === "PENDIENTE"),
    asignadas: visitas.filter((v) => v.estado === "ASIGNADA" && v.mecanicoId === mecanicoId),
  };
}

// ─── HU-06: cerrar visita con trabajo y km ─────────────────────────────────

export type DatosCierre = { trabajoRealizado: string; km: number };

export function validarCierre(datos: unknown, kmActualMoto: number): Resultado<DatosCierre> {
  const esquema = z.object({
    trabajoRealizado: texto("Describe el trabajo realizado").pipe(
      z.string().min(5, "Describe el trabajo con un poco más de detalle"),
    ),
    km: entero("Escribe el kilometraje de la moto").pipe(
      z.number().min(kmActualMoto, `El km no puede ser menor al actual de la moto (${kmActualMoto})`),
    ),
  });
  return validar(esquema, datos);
}
