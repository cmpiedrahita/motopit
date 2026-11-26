// Consultas que usan varias rutas de la API. Aquí no hay reglas de negocio:
// solo leen la base de datos y arman la forma que esperan las pantallas.
import { and, desc, eq, isNotNull, type SQL } from "drizzle-orm";
import { resumenCalificaciones, resumenDe } from "@/lib/calificaciones";
import { puedeContactarMecanico } from "@/lib/contacto";
import { recordatorioAceite } from "@/lib/mantenimiento";
import type { MecanicoPerfil, Perfil, VisitaDetalle } from "@/lib/tipos";
import { getDb, schema } from "./index";

const { domiciliarios, mecanicos, motos, planes, suscripciones, visitas } = schema;

/** Promedio y cantidad de calificaciones de cada mecánico (HU-13). */
export async function calificacionesPorMecanico() {
  const filas = await getDb()
    .select({ mecanicoId: visitas.mecanicoId, calificacion: visitas.calificacion })
    .from(visitas)
    .where(isNotNull(visitas.calificacion));
  return resumenCalificaciones(filas);
}

export async function listarMecanicos(): Promise<MecanicoPerfil[]> {
  const [filas, resumen] = await Promise.all([
    getDb().select().from(mecanicos).orderBy(mecanicos.nombre),
    calificacionesPorMecanico(),
  ]);
  return filas.map((m) => {
    const { promedio, total } = resumenDe(resumen, m.id);
    return {
      id: m.id,
      nombre: m.nombre,
      aniosExperiencia: m.aniosExperiencia,
      verificado: m.verificado,
      promedio,
      totalCalificaciones: total,
    };
  });
}

/** Visitas con su moto, domiciliario y mecánico (si ya fue asignada). */
export async function listarVisitas(condicion: SQL | undefined): Promise<VisitaDetalle[]> {
  const [filas, resumen] = await Promise.all([
    getDb()
      .select({
        id: visitas.id,
        direccion: visitas.direccion,
        fecha: visitas.fecha,
        franja: visitas.franja,
        servicio: visitas.servicio,
        estado: visitas.estado,
        trabajoRealizado: visitas.trabajoRealizado,
        kmCierre: visitas.kmCierre,
        calificacion: visitas.calificacion,
        moto: { placa: motos.placa, marca: motos.marca, kmActual: motos.kmActual },
        domiciliario: { nombre: domiciliarios.nombre, celular: domiciliarios.celular },
        mecanico: {
          id: mecanicos.id,
          nombre: mecanicos.nombre,
          aniosExperiencia: mecanicos.aniosExperiencia,
          verificado: mecanicos.verificado,
          celular: mecanicos.celular,
        },
      })
      .from(visitas)
      .innerJoin(motos, eq(visitas.motoId, motos.id))
      .innerJoin(domiciliarios, eq(motos.domiciliarioId, domiciliarios.id))
      .leftJoin(mecanicos, eq(visitas.mecanicoId, mecanicos.id))
      .where(condicion)
      .orderBy(desc(visitas.fecha), desc(visitas.creadaEn)),
    calificacionesPorMecanico(),
  ]);

  return filas.map((v) => {
    const { promedio, total } = resumenDe(resumen, v.mecanico?.id ?? null);
    return {
      ...v,
      fecha: v.fecha.toISOString(),
      mecanico: v.mecanico
        ? {
            ...v.mecanico,
            // HU-16: el celular solo se comparte mientras el mecánico va en camino (visita ASIGNADA).
            celular: puedeContactarMecanico(v.estado) ? v.mecanico.celular : null,
            promedio,
            totalCalificaciones: total,
          }
        : null,
    };
  });
}

/** Moto y plan activo de un domiciliario. Devuelve null si no existe. */
export async function obtenerPerfil(domiciliarioId: string): Promise<Perfil | null> {
  const db = getDb();
  const [fila] = await db
    .select({
      domiciliario: { id: domiciliarios.id, nombre: domiciliarios.nombre, celular: domiciliarios.celular },
      moto: {
        id: motos.id,
        placa: motos.placa,
        marca: motos.marca,
        kmActual: motos.kmActual,
        kmUltimoAceite: motos.kmUltimoAceite,
      },
    })
    .from(domiciliarios)
    .innerJoin(motos, eq(motos.domiciliarioId, domiciliarios.id))
    .where(eq(domiciliarios.id, domiciliarioId));
  if (!fila) return null;

  const [plan] = await db
    .select({
      id: planes.id,
      codigo: planes.codigo,
      nombre: planes.nombre,
      precioMensual: planes.precioMensual,
      desde: suscripciones.desde,
    })
    .from(suscripciones)
    .innerJoin(planes, eq(suscripciones.planId, planes.id))
    .where(and(eq(suscripciones.domiciliarioId, domiciliarioId), eq(suscripciones.activa, true)))
    .limit(1);

  return {
    ...fila,
    plan: plan ? { ...plan, desde: plan.desde.toISOString() } : null,
    recordatorio: recordatorioAceite(fila.moto.kmActual, fila.moto.kmUltimoAceite),
  };
}
