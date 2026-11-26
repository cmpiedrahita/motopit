import { NextResponse } from "next/server";
import { and, eq, inArray } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { errorInterno, esUuid, noEncontrado, responderErrores } from "@/lib/api";
import { logger } from "@/lib/logger";
import { sinSesion, usuarioEnSesion } from "@/lib/sesion-servidor";
import { cancelarVisita } from "@/lib/visitas";

export const dynamic = "force-dynamic";

// PATCH /api/visitas/:id/cancelar → HU-15: el domiciliario cancela una visita que todavía no se ha hecho.
// 200 · 401 sin sesión · 404 no existe o no es del domiciliario · 409 ya completada o cancelada.
export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // HU-18: el domiciliario sale de la sesión, nunca del cuerpo de la petición.
  const domiciliarioId = await usuarioEnSesion("domiciliario");
  if (!domiciliarioId) return sinSesion();
  if (!esUuid(id)) return noEncontrado("La visita no existe");

  try {
    const db = getDb();
    const [fila] = await db
      .select({ estado: schema.visitas.estado, domiciliarioId: schema.motos.domiciliarioId })
      .from(schema.visitas)
      .innerJoin(schema.motos, eq(schema.visitas.motoId, schema.motos.id))
      .where(eq(schema.visitas.id, id));
    // Si la visita es de otro domiciliario respondemos 404 para no revelar que existe.
    if (!fila || fila.domiciliarioId !== domiciliarioId) return noEncontrado("La visita no existe");

    try {
      cancelarVisita(fila.estado);
    } catch {
      return responderErrores({ general: "Esta visita ya no se puede cancelar" }, 409);
    }

    // El where con el estado evita carreras: si el mecánico la cerró justo ahora, no se toca.
    const [actualizada] = await db
      .update(schema.visitas)
      .set({ estado: "CANCELADA" })
      .where(and(eq(schema.visitas.id, id), inArray(schema.visitas.estado, ["PENDIENTE", "ASIGNADA"])))
      .returning({ id: schema.visitas.id });
    if (!actualizada) return responderErrores({ general: "Esta visita ya no se puede cancelar" }, 409);

    logger.info("visita cancelada", { visitaId: id });
    return NextResponse.json({ id, estado: "CANCELADA" });
  } catch (error) {
    return errorInterno(error, "cancelar visita");
  }
}
