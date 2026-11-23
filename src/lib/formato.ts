// Formatos y etiquetas para mostrar datos en pantalla (pesos, km, fechas, estados).

export const ZONA_HORARIA = "America/Bogota";

export const FRANJAS = {
  MANANA: "Mañana (7 a. m. – 12 m.)",
  TARDE: "Tarde (12 m. – 5 p. m.)",
  NOCHE: "Noche (5 p. m. – 9 p. m.)",
} as const;

export const SERVICIOS = {
  CAMBIO_ACEITE: "Cambio de aceite",
  FRENOS: "Frenos",
  CADENA: "Cadena (ajuste y lubricación)",
  REVISION_GENERAL: "Revisión general",
} as const;

export const ESTADOS = {
  PENDIENTE: "Pendiente",
  ASIGNADA: "Asignada",
  COMPLETADA: "Completada",
  CANCELADA: "Cancelada",
} as const;

export type Franja = keyof typeof FRANJAS;
export type Servicio = keyof typeof SERVICIOS;

const pesos = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
const miles = new Intl.NumberFormat("es-CO");

/** 45000 → "$ 45.000" */
export function formatearPesos(valor: number): string {
  return pesos.format(valor).replace(/ /g, " ");
}

/** 12345 → "12.345 km" */
export function formatearKm(km: number): string {
  return `${miles.format(km)} km`;
}

/** Fecha de hoy en Colombia como "AAAA-MM-DD" (el formato de <input type="date">). */
export function hoyEnBogota(ahora = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: ZONA_HORARIA }).format(ahora);
}

/**
 * Convierte "AAAA-MM-DD" a Date. Se guarda a mediodía UTC para que el día
 * no cambie al mostrarlo en Colombia (UTC-5) ni en el servidor (UTC).
 */
export function fechaADate(fecha: string): Date {
  return new Date(`${fecha}T12:00:00Z`);
}

/** "lun, 24 nov 2026" */
export function formatearFecha(fecha: Date | string): string {
  return new Date(fecha).toLocaleDateString("es-CO", {
    timeZone: ZONA_HORARIA,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
