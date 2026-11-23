import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { errorInterno, esUuid, leerCuerpo, noEncontrado, responderErrores } from "@/lib/api";
import { logger } from "@/lib/logger";
import { recordatorioAceite, validarNuevoKm } from "@/lib/mantenimiento";

export const dynamic = "force-dynamic";

// PATCH /api/motos/:id { km } → HU-08: actualiza el kilometraje.
// 200 { kmActual, recordatorio } · 400 km inválido o menor al actual · 404 moto no existe.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!esUuid(id)) return noEncontrado("La moto no existe");
  const cuerpo = await leerCuerpo(req);

  try {
    const db = getDb();
    const [moto] = await db.select().from(schema.motos).where(eq(schema.motos.id, id));
    if (!moto) return noEncontrado("La moto no existe");

    const validacion = validarNuevoKm(cuerpo, moto.kmActual);
    if (!validacion.ok) return responderErrores(validacion.errores, 400);

    await db.update(schema.motos).set({ kmActual: validacion.datos.km }).where(eq(schema.motos.id, id));
    logger.info("km actualizado", { motoId: id, antes: moto.kmActual, ahora: validacion.datos.km });

    return NextResponse.json({
      kmActual: validacion.datos.km,
      recordatorio: recordatorioAceite(validacion.datos.km, moto.kmUltimoAceite),
    });
  } catch (error) {
    return errorInterno(error, "actualizar km");
  }
}
