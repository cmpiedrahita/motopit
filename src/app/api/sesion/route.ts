import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { errorInterno, leerCuerpo, responderErrores } from "@/lib/api";
import {
  estaBloqueado,
  MENSAJE_CREDENCIALES,
  TRAS_INGRESO_EXITOSO,
  trasIntentoFallido,
  validarIngreso,
  verificarPin,
  type Rol,
} from "@/lib/auth";
import { logger } from "@/lib/logger";
import { cerrarSesion, iniciarSesion, usuarioEnSesion } from "@/lib/sesion-servidor";

export const dynamic = "force-dynamic";

// GET /api/sesion → { domiciliarioId, mecanicoId }: quién tiene sesión en este navegador.
export async function GET() {
  const [domiciliarioId, mecanicoId] = await Promise.all([usuarioEnSesion("domiciliario"), usuarioEnSesion("mecanico")]);
  return NextResponse.json({ domiciliarioId, mecanicoId });
}

// POST /api/sesion { rol, celular, pin } → HU-18: ingresa con celular y PIN.
// 200 { rol, id } · 400 datos inválidos · 401 celular o PIN incorrectos · 429 bloqueado por intentos.
export async function POST(req: Request) {
  const validacion = validarIngreso(await leerCuerpo(req));
  if (!validacion.ok) return responderErrores(validacion.errores, 400);
  const { rol, celular, pin } = validacion.datos;
  const tabla = rol === "domiciliario" ? schema.domiciliarios : schema.mecanicos;

  try {
    const db = getDb();
    const [usuario] = await db
      .select({
        id: tabla.id,
        pinHash: tabla.pinHash,
        intentosFallidos: tabla.intentosFallidos,
        bloqueadoHasta: tabla.bloqueadoHasta,
      })
      .from(tabla)
      .where(eq(tabla.celular, celular));

    // Mismo mensaje si el celular no existe o si el PIN está mal: no se revela qué celulares están registrados.
    if (!usuario) return responderErrores({ pin: MENSAJE_CREDENCIALES }, 401);

    if (estaBloqueado(usuario.bloqueadoHasta)) {
      return responderErrores({ general: "Demasiados intentos fallidos. Intenta de nuevo en 15 minutos." }, 429);
    }

    if (!verificarPin(pin, usuario.pinHash)) {
      const cambios = trasIntentoFallido(usuario.intentosFallidos);
      await db.update(tabla).set(cambios).where(eq(tabla.id, usuario.id));
      logger.warn("ingreso fallido", { rol, bloqueado: !!cambios.bloqueadoHasta });
      if (cambios.bloqueadoHasta) {
        return responderErrores({ general: "Demasiados intentos fallidos. Intenta de nuevo en 15 minutos." }, 429);
      }
      return responderErrores({ pin: MENSAJE_CREDENCIALES }, 401);
    }

    await db.update(tabla).set(TRAS_INGRESO_EXITOSO).where(eq(tabla.id, usuario.id));
    await iniciarSesion(rol, usuario.id);
    logger.info("ingreso", { rol, id: usuario.id });
    return NextResponse.json({ rol, id: usuario.id });
  } catch (error) {
    return errorInterno(error, "ingreso");
  }
}

// DELETE /api/sesion?rol=domiciliario|mecanico → cierra la sesión de ese rol (o de ambos si no se indica).
export async function DELETE(req: Request) {
  const rol = new URL(req.url).searchParams.get("rol");
  const roles: Rol[] = rol === "domiciliario" || rol === "mecanico" ? [rol] : ["domiciliario", "mecanico"];
  for (const r of roles) await cerrarSesion(r);
  return NextResponse.json({ ok: true });
}
