import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { listarVisitas } from "@/db/consultas";
import { hayChoqueDeFecha, MENSAJE_CHOQUE, validarAgenda } from "@/lib/agenda";
import { errorInterno, leerCuerpo, noEncontrado, responderErrores } from "@/lib/api";
import { fechaADate, hoyEnBogota } from "@/lib/formato";
import { logger } from "@/lib/logger";
import { sinSesion, usuarioEnSesion } from "@/lib/sesion-servidor";

export const dynamic = "force-dynamic";

// GET /api/visitas → HU-05 y HU-09: visitas del domiciliario en sesión, con su estado y mecánico.
export async function GET() {
  const domiciliarioId = await usuarioEnSesion("domiciliario");
  if (!domiciliarioId) return sinSesion();
  try {
    return NextResponse.json(await listarVisitas(eq(schema.motos.domiciliarioId, domiciliarioId)));
  } catch (error) {
    return errorInterno(error, "listar visitas");
  }
}

// POST /api/visitas → HU-03: agenda una visita donde está la moto. Queda PENDIENTE.
// 201 creada · 400 datos inválidos · 401 sin sesión · 404 sin moto · 409 sin plan o fecha ocupada.
export async function POST(req: Request) {
  const domiciliarioId = await usuarioEnSesion("domiciliario");
  if (!domiciliarioId) return sinSesion();
  // HU-18: el domiciliario sale de la sesión, nunca del cuerpo de la petición.
  const cuerpo = { ...(await leerCuerpo(req)), domiciliarioId };

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

    const visita = await db.transaction(async (tx) => {
      // El bloqueo de la moto serializa las solicitudes simultáneas para esa moto.
      await tx.select({ id: schema.motos.id }).from(schema.motos).where(eq(schema.motos.id, moto.id)).for("update");
      const visitasDeLaMoto = await tx
        .select({ estado: schema.visitas.estado, fecha: schema.visitas.fecha })
        .from(schema.visitas)
        .where(eq(schema.visitas.motoId, moto.id));
      if (hayChoqueDeFecha(visitasDeLaMoto, fecha)) return null;

      const [creada] = await tx
        .insert(schema.visitas)
        .values({ motoId: moto.id, direccion, fecha: fechaADate(fecha), franja, servicio, estado: "PENDIENTE" })
        .returning({ id: schema.visitas.id, estado: schema.visitas.estado });
      return creada;
    });
    if (!visita) return responderErrores({ fecha: MENSAJE_CHOQUE }, 409);

    logger.info("visita agendada", { visitaId: visita.id, placa: moto.placa, fecha, franja, servicio });
    return NextResponse.json(visita, { status: 201 });
  } catch (error) {
    return errorInterno(error, "agendar visita");
  }
}
