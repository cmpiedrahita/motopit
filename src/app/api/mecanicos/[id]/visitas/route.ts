import { NextResponse } from "next/server";
import { and, eq, or } from "drizzle-orm";
import { schema } from "@/db";
import { listarVisitas } from "@/db/consultas";
import { errorInterno, esUuid, noEncontrado } from "@/lib/api";
import { sinPermiso, sinSesion, usuarioEnSesion } from "@/lib/sesion-servidor";
import { clasificarParaMecanico } from "@/lib/visitas";

export const dynamic = "force-dynamic";

// GET /api/mecanicos/:id/visitas → HU-04 y HU-06: { pendientes, asignadas } para la pantalla del mecánico.
// Las visitas asignadas a otro mecánico no aparecen. HU-18: solo el propio mecánico ve su tablero.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const enSesion = await usuarioEnSesion("mecanico");
  if (!enSesion) return sinSesion();
  if (!esUuid(id)) return noEncontrado("El mecánico no existe");
  if (enSesion !== id) return sinPermiso();
  try {
    const visitas = await listarVisitas(
      or(
        eq(schema.visitas.estado, "PENDIENTE"),
        and(eq(schema.visitas.estado, "ASIGNADA"), eq(schema.visitas.mecanicoId, id)),
      ),
    );
    const { pendientes, asignadas } = clasificarParaMecanico(
      visitas.map((v) => ({ ...v, mecanicoId: v.mecanico?.id ?? null })),
      id,
    );
    // Primero las más próximas.
    const porFecha = (a: { fecha: string }, b: { fecha: string }) => a.fecha.localeCompare(b.fecha);
    return NextResponse.json({ pendientes: pendientes.sort(porFecha), asignadas: asignadas.sort(porFecha) });
  } catch (error) {
    return errorInterno(error, "visitas del mecánico");
  }
}
