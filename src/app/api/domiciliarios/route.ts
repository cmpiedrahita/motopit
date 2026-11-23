import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { errorInterno, esDuplicado, leerCuerpo, responderErrores } from "@/lib/api";
import { logger } from "@/lib/logger";
import { erroresDuplicados, normalizarCelular, validarRegistro } from "@/lib/registro";

export const dynamic = "force-dynamic";

// POST /api/domiciliarios → HU-01: registra al domiciliario con su moto.
// 201 { id } · 400 datos inválidos · 409 placa o celular ya registrados.
export async function POST(req: Request) {
  const validacion = validarRegistro(await leerCuerpo(req));
  if (!validacion.ok) return responderErrores(validacion.errores, 400);
  const { nombre, celular, placa, marca, km } = validacion.datos;

  try {
    const db = getDb();
    const [conCelular] = await db
      .select({ id: schema.domiciliarios.id })
      .from(schema.domiciliarios)
      .where(eq(schema.domiciliarios.celular, celular));
    const [conPlaca] = await db.select({ id: schema.motos.id }).from(schema.motos).where(eq(schema.motos.placa, placa));
    const duplicados = erroresDuplicados({ celular: !!conCelular, placa: !!conPlaca });
    if (duplicados) return responderErrores(duplicados, 409);

    const id = await db.transaction(async (tx) => {
      const [domiciliario] = await tx
        .insert(schema.domiciliarios)
        .values({ nombre, celular })
        .returning({ id: schema.domiciliarios.id });
      // Al registrarse se toma el km actual como punto de partida del recordatorio de aceite (HU-07).
      await tx.insert(schema.motos).values({ placa, marca, kmActual: km, kmUltimoAceite: km, domiciliarioId: domiciliario.id });
      return domiciliario.id;
    });

    logger.info("domiciliario registrado", { domiciliarioId: id, placa });
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    // Dos registros al mismo tiempo con la misma placa o celular: lo detiene la restricción UNIQUE.
    if (esDuplicado(error)) return responderErrores({ general: "La placa o el celular ya están registrados" }, 409);
    return errorInterno(error, "registro");
  }
}

// GET /api/domiciliarios?celular=3001234567 → { id }: para volver a entrar desde otro celular o navegador.
export async function GET(req: Request) {
  const celular = normalizarCelular(new URL(req.url).searchParams.get("celular") ?? "");
  if (!celular) return responderErrores({ celular: "Escribe tu celular" }, 400);
  try {
    const [domiciliario] = await getDb()
      .select({ id: schema.domiciliarios.id })
      .from(schema.domiciliarios)
      .where(eq(schema.domiciliarios.celular, celular));
    if (!domiciliario) return responderErrores({ celular: "No encontramos ese celular. ¿Ya te registraste?" }, 404);
    return NextResponse.json(domiciliario);
  } catch (error) {
    return errorInterno(error, "buscar domiciliario");
  }
}
