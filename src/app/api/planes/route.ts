import { NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { errorInterno } from "@/lib/api";

export const dynamic = "force-dynamic";

// GET /api/planes → HU-02: planes con precio, lo que incluye y lo que NO incluye.
export async function GET() {
  try {
    const planes = await getDb().select().from(schema.planes).orderBy(asc(schema.planes.precioMensual));
    return NextResponse.json(planes);
  } catch (error) {
    return errorInterno(error, "listar planes");
  }
}
