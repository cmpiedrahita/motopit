import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { listarVisitas } from "@/db/consultas";
import { validarAgenda } from "@/lib/agenda";
import { errorInterno, esUuid, leerCuerpo, noEncontrado, responderErrores } from "@/lib/api";
import { fechaADate, hoyEnBogota } from "@/lib/formato";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

// GET /api/visitas?domiciliarioId=... → HU-05 y HU-09: visitas del domiciliario con su estado y mecánico.
export async function GET(req: Request) {
  const domiciliarioId = new URL(req.url).searchParams.get("domiciliarioId");
  if (!esUuid(domiciliarioId)) return responderErrores({ domiciliarioId: "Falta el domiciliario" }, 400);
  try {
    return NextResponse.json(await listarVisitas(eq(schema.motos.domiciliarioId, domiciliarioId)));
  } catch (error) {
    return errorInterno(error, "listar visitas");
  }
}

// POST /api/visitas → HU-03: agenda una visita donde está la moto. Queda PENDIENTE.
// 201 { id, estado } · 400 datos inválidos · 404 domiciliario sin moto · 409 sin plan activo.
export async function POST(req: Request) {
  const cuerpo = await leerCuerpo(req);
  if (!esUuid(cuerpo.domiciliarioId)) return responderErrores({ domiciliarioId: "Falta el domiciliario" }, 400);
  const domiciliarioId = cuerpo.domiciliarioId;

  try {
    const db = getDb();
    const [moto] = await db.select().from(schema.motos).where(eq(schema.motos.domiciliarioId, domiciliarioId));
    if (!moto) return noEncontrado("No encontramos tu moto. Regístrate primero.");

    const [planActivo] = await db
      .select({ id: schema.suscripciones.id })
      .from(schema.suscripciones)
      .where(and(eq(schema.suscripciones.domiciliarioId, domiciliarioId), eq(schema.suscripciones.activa, true)));

    const validacion = validarAgenda(cuerpo, { tienePlanActivo: !!planActivo, hoy: hoyEnBogota() });
    if (!validacion.ok) return responderErrores(validacion.errores, validacion.errores.plan ? 409 : 400);
    const { direccion, fecha, franja, servicio } = validacion.datos;

    const [visita] = await db
      .insert(schema.visitas)
      .values({ motoId: moto.id, direccion, fecha: fechaADate(fecha), franja, servicio, estado: "PENDIENTE" })
      .returning({ id: schema.visitas.id, estado: schema.visitas.estado });

    logger.info("visita agendada", { visitaId: visita.id, placa: moto.placa, fecha, franja, servicio });
    return NextResponse.json(visita, { status: 201 });
  } catch (error) {
    return errorInterno(error, "agendar visita");
  }
}
