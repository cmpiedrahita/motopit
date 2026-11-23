import { NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { errorInterno, esUuid, leerCuerpo, noEncontrado, responderErrores } from "@/lib/api";
import { puedeCalificar, validarCalificacion } from "@/lib/calificaciones";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

// POST /api/visitas/:id/calificacion { domiciliarioId, calificacion } → HU-13: califica al mecánico de 1 a 5.
// 200 · 400 fuera de rango · 404 no existe o no es del domiciliario · 409 no completada o ya calificada.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!esUuid(id)) return noEncontrado("La visita no existe");
  const validacion = validarCalificacion(await leerCuerpo(req));
  if (!validacion.ok) return responderErrores(validacion.errores, 400);
  const { domiciliarioId, calificacion } = validacion.datos;

  try {
    const db = getDb();
    const [fila] = await db
      .select({ visita: schema.visitas, domiciliarioId: schema.motos.domiciliarioId })
      .from(schema.visitas)
      .innerJoin(schema.motos, eq(schema.visitas.motoId, schema.motos.id))
      .where(eq(schema.visitas.id, id));
    // Si la visita es de otro domiciliario respondemos 404 para no revelar que existe.
    if (!fila || fila.domiciliarioId !== domiciliarioId) return noEncontrado("La visita no existe");

    if (!puedeCalificar(fila.visita)) {
      const mensaje = fila.visita.calificacion !== null ? "Ya calificaste esta visita" : "Solo puedes calificar visitas completadas";
      return responderErrores({ calificacion: mensaje }, 409);
    }

    const [actualizada] = await db
      .update(schema.visitas)
      .set({ calificacion })
      .where(and(eq(schema.visitas.id, id), isNull(schema.visitas.calificacion)))
      .returning({ id: schema.visitas.id });
    if (!actualizada) return responderErrores({ calificacion: "Ya calificaste esta visita" }, 409);

    logger.info("visita calificada", { visitaId: id, mecanicoId: fila.visita.mecanicoId, calificacion });
    return NextResponse.json({ id, calificacion });
  } catch (error) {
    return errorInterno(error, "calificar visita");
  }
}
