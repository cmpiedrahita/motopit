import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { errorInterno, esUuid, leerCuerpo, noEncontrado, responderErrores } from "@/lib/api";
import { logger } from "@/lib/logger";
import { motoTrasCierre } from "@/lib/mantenimiento";
import { cambiarEstado, validarCierre } from "@/lib/visitas";

export const dynamic = "force-dynamic";

// PATCH /api/visitas/:id/cerrar { mecanicoId, trabajoRealizado, km } → HU-06.
// La visita pasa a COMPLETADA y se actualiza el km de la moto (y el del último aceite si aplica).
// 200 · 400 datos inválidos · 403 no es su visita · 404 no existe · 409 no está asignada.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!esUuid(id)) return noEncontrado("La visita no existe");
  const cuerpo = await leerCuerpo(req);

  try {
    const db = getDb();
    const [fila] = await db
      .select({ visita: schema.visitas, moto: schema.motos })
      .from(schema.visitas)
      .innerJoin(schema.motos, eq(schema.visitas.motoId, schema.motos.id))
      .where(eq(schema.visitas.id, id));
    if (!fila) return noEncontrado("La visita no existe");
    const { visita, moto } = fila;

    if (visita.mecanicoId !== cuerpo.mecanicoId) {
      return responderErrores({ general: "Solo el mecánico asignado puede cerrar esta visita" }, 403);
    }
    try {
      cambiarEstado(visita.estado, "COMPLETADA");
    } catch {
      return responderErrores({ general: "Solo se puede cerrar una visita asignada" }, 409);
    }

    const validacion = validarCierre(cuerpo, moto.kmActual);
    if (!validacion.ok) return responderErrores(validacion.errores, 400);
    const { trabajoRealizado, km } = validacion.datos;

    const cerrada = await db.transaction(async (tx) => {
      const [v] = await tx
        .update(schema.visitas)
        .set({ estado: "COMPLETADA", trabajoRealizado, kmCierre: km })
        .where(and(eq(schema.visitas.id, id), eq(schema.visitas.estado, "ASIGNADA")))
        .returning({ id: schema.visitas.id });
      if (!v) return false;
      await tx
        .update(schema.motos)
        .set(motoTrasCierre(km, visita.servicio, moto.kmUltimoAceite))
        .where(eq(schema.motos.id, moto.id));
      return true;
    });
    if (!cerrada) return responderErrores({ general: "Solo se puede cerrar una visita asignada" }, 409);

    logger.info("visita completada", { visitaId: id, mecanicoId: visita.mecanicoId, km, servicio: visita.servicio });
    return NextResponse.json({ id, estado: "COMPLETADA", kmCierre: km });
  } catch (error) {
    return errorInterno(error, "cerrar visita");
  }
}
