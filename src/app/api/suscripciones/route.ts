import { NextResponse } from "next/server";
import { eq, inArray } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { errorInterno, leerCuerpo, noEncontrado, responderErrores } from "@/lib/api";
import { logger } from "@/lib/logger";
import { planearCambioDePlan, validarEleccionPlan } from "@/lib/planes";

export const dynamic = "force-dynamic";

// POST /api/suscripciones { domiciliarioId, planId } → HU-02: deja activo el plan elegido.
// Solo un plan activo a la vez: elegir otro desactiva el anterior.
// 201 nueva suscripción · 200 ese plan ya estaba activo · 400 inválido · 404 no existe.
export async function POST(req: Request) {
  const validacion = validarEleccionPlan(await leerCuerpo(req));
  if (!validacion.ok) return responderErrores(validacion.errores, 400);
  const { domiciliarioId, planId } = validacion.datos;

  try {
    const db = getDb();
    const [domiciliario] = await db
      .select({ id: schema.domiciliarios.id })
      .from(schema.domiciliarios)
      .where(eq(schema.domiciliarios.id, domiciliarioId));
    if (!domiciliario) return noEncontrado("El domiciliario no existe");

    const [plan] = await db.select().from(schema.planes).where(eq(schema.planes.id, planId));
    if (!plan) return responderErrores({ planId: "El plan no existe" }, 404);

    const actuales = await db
      .select({ id: schema.suscripciones.id, planId: schema.suscripciones.planId, activa: schema.suscripciones.activa })
      .from(schema.suscripciones)
      .where(eq(schema.suscripciones.domiciliarioId, domiciliarioId));
    const { desactivar, crear } = planearCambioDePlan(actuales, planId);

    await db.transaction(async (tx) => {
      if (desactivar.length) {
        await tx.update(schema.suscripciones).set({ activa: false }).where(inArray(schema.suscripciones.id, desactivar));
      }
      if (crear) await tx.insert(schema.suscripciones).values({ domiciliarioId, planId });
    });

    logger.info("plan elegido", { domiciliarioId, plan: plan.codigo, desactivadas: desactivar.length });
    return NextResponse.json({ plan: { id: plan.id, nombre: plan.nombre } }, { status: crear ? 201 : 200 });
  } catch (error) {
    return errorInterno(error, "elegir plan");
  }
}
