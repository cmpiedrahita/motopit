import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// La conexión se crea al primer uso, así el build no necesita una base de datos.
let instancia: ReturnType<typeof drizzle<typeof schema>> | undefined;

export function getDb() {
  if (!instancia) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("Falta la variable DATABASE_URL (ver .env.example)");
    instancia = drizzle(postgres(url, { max: 5, prepare: false }), { schema });
  }
  return instancia;
}

export { schema };
