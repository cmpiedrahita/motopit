import { NextResponse } from "next/server";
import { obtenerPerfil } from "@/db/consultas";
import { errorInterno, esUuid, noEncontrado } from "@/lib/api";
import { sinPermiso, sinSesion, usuarioEnSesion } from "@/lib/sesion-servidor";

export const dynamic = "force-dynamic";

// GET /api/domiciliarios/:id → perfil para la pantalla de inicio:
// moto, plan activo (HU-02) y recordatorio de aceite (HU-07).
// HU-18: solo el propio domiciliario puede ver su perfil (401 sin sesión · 403 si es de otro).
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const enSesion = await usuarioEnSesion("domiciliario");
  if (!enSesion) return sinSesion();
  if (!esUuid(id)) return noEncontrado("El domiciliario no existe");
  if (enSesion !== id) return sinPermiso();
  try {
    const perfil = await obtenerPerfil(id);
    if (!perfil) return noEncontrado("El domiciliario no existe");
    return NextResponse.json(perfil);
  } catch (error) {
    return errorInterno(error, "perfil");
  }
}
