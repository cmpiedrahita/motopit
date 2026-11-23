import { NextResponse } from "next/server";
import { listarMecanicos } from "@/db/consultas";
import { errorInterno } from "@/lib/api";

export const dynamic = "force-dynamic";

// GET /api/mecanicos → mecánicos aliados con su perfil (HU-13): experiencia, verificado y calificación.
export async function GET() {
  try {
    return NextResponse.json(await listarMecanicos());
  } catch (error) {
    return errorInterno(error, "listar mecánicos");
  }
}
