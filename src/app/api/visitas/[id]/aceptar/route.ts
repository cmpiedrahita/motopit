import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { errorInterno, esUuid, leerCuerpo, noEncontrado, responderErrores } from "@/lib/api";
import { logger } from "@/lib/logger";
import { aceptarVisita } from "@/lib/visitas";

export const dynamic = "force-dynamic";

const YA_ACEPTADA = { general: "Esta visita ya fue aceptada por otro mecánico" };

// PATCH /api/visitas/:id/aceptar { mecanicoId } → HU-04: la visita pasa a ASIGNADA con ese mecánico.
// 200 · 400 sin mecánico · 404 no existe · 409 ya no está pendiente.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!esUuid(id)) return noEncontrado("La visita no existe");
  const { mecanicoId } = await leerCuerpo(req);
  if (!esUuid(mecanicoId)) return responderErrores({ mecanicoId: "Elige qué mecánico eres" }, 400);

  try {
    const db = getDb();
    const [mecanico] = await db.select().from(schema.mecanicos).where(eq(schema.mecanicos.id, mecanicoId));
    if (!mecanico) return responderErrores({ mecanicoId: "El mecánico no existe" }, 404);

    const [visita] = await db.select().from(schema.visitas).where(eq(schema.visitas.id, id));
    if (!visita) return noEncontrado("La visita no existe");

    let cambios;
    try {
      cambios = aceptarVisita(visita, mecanicoId);
    } catch {
      return responderErrores(YA_ACEPTADA, 409);
    }

    // El "where estado = PENDIENTE" evita que dos mecánicos acepten la misma visita al mismo tiempo.
    const [actualizada] = await db
      .update(schema.visitas)
      .set(cambios)
      .where(and(eq(schema.visitas.id, id), eq(schema.visitas.estado, "PENDIENTE")))
      .returning({ id: schema.visitas.id, estado: schema.visitas.estado });
    if (!actualizada) return responderErrores(YA_ACEPTADA, 409);

    logger.info("visita aceptada", { visitaId: id, mecanicoId });
    return NextResponse.json({ ...actualizada, mecanico: { id: mecanico.id, nombre: mecanico.nombre } });
  } catch (error) {
    return errorInterno(error, "aceptar visita");
  }
}
