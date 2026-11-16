import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { getDb } from "@/db";
import { revisarSalud } from "@/lib/health";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

// GET /api/health → 200 si todo está bien, 503 si la base de datos no responde.
export async function GET() {
  const salud = await revisarSalud(() => getDb().execute(sql`select 1`));
  if (salud.status !== "ok") logger.error("health: base de datos caída", { ...salud });
  return NextResponse.json(salud, { status: salud.status === "ok" ? 200 : 503 });
}
