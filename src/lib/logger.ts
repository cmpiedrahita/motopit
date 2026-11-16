// Logger mínimo en JSON: una línea por evento, fácil de filtrar en los logs de Vercel.
type Nivel = "info" | "warn" | "error";

function log(nivel: Nivel, mensaje: string, datos: Record<string, unknown> = {}) {
  const linea = JSON.stringify({ nivel, mensaje, ...datos, ts: new Date().toISOString() });
  if (nivel === "error") console.error(linea);
  else if (nivel === "warn") console.warn(linea);
  else console.log(linea);
}

export const logger = {
  info: (mensaje: string, datos?: Record<string, unknown>) => log("info", mensaje, datos),
  warn: (mensaje: string, datos?: Record<string, unknown>) => log("warn", mensaje, datos),
  error: (mensaje: string, datos?: Record<string, unknown>) => log("error", mensaje, datos),
};
