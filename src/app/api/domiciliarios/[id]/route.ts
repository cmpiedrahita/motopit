import { NextResponse } from "next/server";
import { obtenerPerfil } from "@/db/consultas";
import { errorInterno, esUuid, noEncontrado } from "@/lib/api";

export const dynamic = "force-dynamic";

// GET /api/domiciliarios/:id → perfil para la pantalla de inicio:
// moto, plan activo (HU-02) y recordatorio de aceite (HU-07).
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!esUuid(id)) return noEncontrado("El domiciliario no existe");
  try {
    const perfil = await obtenerPerfil(id);
    if (!perfil) return noEncontrado("El domiciliario no existe");
    return NextResponse.json(perfil);
  } catch (error) {
    return errorInterno(error, "perfil");
  }
}
