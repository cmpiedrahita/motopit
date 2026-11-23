import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { errorInterno, esDuplicado, leerCuerpo, responderErrores } from "@/lib/api";
import { cifrarPin } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { erroresDuplicados, validarRegistro } from "@/lib/registro";
import { iniciarSesion } from "@/lib/sesion-servidor";

export const dynamic = "force-dynamic";

// POST /api/domiciliarios → HU-01: registra al domiciliario con su moto.
// HU-18: guarda el PIN cifrado y deja la sesión iniciada.
// 201 { id } · 400 datos inválidos · 409 placa o celular ya registrados.
export async function POST(req: Request) {
  const validacion = validarRegistro(await leerCuerpo(req));
  if (!validacion.ok) return responderErrores(validacion.errores, 400);
  const { nombre, celular, placa, marca, km, pin } = validacion.datos;

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
        .values({ nombre, celular, pinHash: cifrarPin(pin) })
        .returning({ id: schema.domiciliarios.id });
      // Al registrarse se toma el km actual como punto de partida del recordatorio de aceite (HU-07).
      await tx.insert(schema.motos).values({ placa, marca, kmActual: km, kmUltimoAceite: km, domiciliarioId: domiciliario.id });
      return domiciliario.id;
    });

    await iniciarSesion("domiciliario", id);
    logger.info("domiciliario registrado", { domiciliarioId: id, placa });
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    // Dos registros al mismo tiempo con la misma placa o celular: lo detiene la restricción UNIQUE.
    if (esDuplicado(error)) return responderErrores({ general: "La placa o el celular ya están registrados" }, 409);
    return errorInterno(error, "registro");
  }
}
