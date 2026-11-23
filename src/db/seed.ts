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

// Mecánicos ficticios para la demo. Uno sin verificar, para mostrar la diferencia en el perfil (HU-13).
const mecanicos = [
  { nombre: "Jhon Fredy Ríos", celular: "3000000001", aniosExperiencia: 8, verificado: true },
  { nombre: "Luisa Fernanda Mora", celular: "3000000002", aniosExperiencia: 5, verificado: true },
  { nombre: "Camilo Andrés Peña", celular: "3000000003", aniosExperiencia: 2, verificado: false },
];

async function main() {
  const db = getDb();
  await db.insert(schema.planes).values(planes).onConflictDoNothing({ target: schema.planes.codigo });
  // Si el mecánico ya existe (mismo celular) se actualizan sus datos: el seed se puede correr varias veces.
  for (const m of mecanicos) {
    await db
      .insert(schema.mecanicos)
      .values(m)
      .onConflictDoUpdate({
        target: schema.mecanicos.celular,
        set: { nombre: m.nombre, aniosExperiencia: m.aniosExperiencia, verificado: m.verificado },
      });
  }
  console.log(`Seed listo: ${planes.length} planes, ${mecanicos.length} mecánicos`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
