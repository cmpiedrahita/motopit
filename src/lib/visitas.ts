// Ciclo de vida de una visita. Todas las historias que cambian el estado
// (HU-03 agendar, HU-04 aceptar, HU-06 cerrar) deben pasar por aquí.

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
