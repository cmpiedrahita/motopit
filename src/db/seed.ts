// Datos iniciales para el entorno de demo: planes y mecánicos aliados.
// Uso: npm run db:seed
import "dotenv/config";
import { getDb, schema } from "./index";

const planes = [
  {
    codigo: "BASICO",
    nombre: "Plan Básico",
    precioMensual: 45000,
    incluye: ["1 cambio de aceite al mes (aceite incluido)", "Revisión y lubricación de cadena", "Revisión de frenos", "Mano de obra de la visita"],
    noIncluye: ["Repuestos (pastillas, llantas, kit de arrastre)", "Reparaciones de motor"],
  },
  {
    codigo: "FULL",
    nombre: "Plan Full",
    precioMensual: 75000,
    incluye: ["Todo lo del Plan Básico", "1 visita extra por falla al mes", "Ajuste de frenos y cadena cuando se necesite", "Mano de obra de todas las visitas"],
    noIncluye: ["Repuestos mayores (llantas, kit de arrastre)", "Reparaciones de motor"],
  },
];

const mecanicos = [
  { nombre: "Mecánico Demo 1", celular: "3000000001", aniosExperiencia: 8, verificado: true },
  { nombre: "Mecánico Demo 2", celular: "3000000002", aniosExperiencia: 3, verificado: false },
];

async function main() {
  const db = getDb();
  await db.insert(schema.planes).values(planes).onConflictDoNothing({ target: schema.planes.codigo });
  await db.insert(schema.mecanicos).values(mecanicos).onConflictDoNothing({ target: schema.mecanicos.celular });
  console.log(`Seed listo: ${planes.length} planes, ${mecanicos.length} mecánicos`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
