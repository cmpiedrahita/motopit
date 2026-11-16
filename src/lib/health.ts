// Comprobación de salud: la app responde y la base de datos está disponible.
// Se separa de la ruta para poder probarla sin una base de datos real.

export type EstadoSalud = {
  status: "ok" | "degradado";
  db: "up" | "down";
  version: string;
  timestamp: string;
};

export async function revisarSalud(
  pingDb: () => Promise<unknown>,
  version = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local",
): Promise<EstadoSalud> {
  let db: EstadoSalud["db"] = "up";
  try {
    await pingDb();
  } catch {
    db = "down";
  }
  return {
    status: db === "up" ? "ok" : "degradado",
    db,
    version,
    timestamp: new Date().toISOString(),
  };
}
