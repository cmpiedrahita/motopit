// Modelo de datos de MotoPit (MVP).
// Después de cambiar este archivo: `npm run db:generate` crea la migración en /drizzle y se sube al repo.
import { boolean, integer, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const estadoVisita = pgEnum("estado_visita", ["PENDIENTE", "ASIGNADA", "COMPLETADA", "CANCELADA"]);
export const franja = pgEnum("franja", ["MANANA", "TARDE", "NOCHE"]);
export const servicio = pgEnum("servicio", ["CAMBIO_ACEITE", "FRENOS", "CADENA", "REVISION_GENERAL"]);

export const domiciliarios = pgTable("domiciliarios", {
  id: uuid("id").primaryKey().defaultRandom(),
  nombre: text("nombre").notNull(),
  celular: text("celular").notNull().unique(),
  creadoEn: timestamp("creado_en").notNull().defaultNow(),
});

export const motos = pgTable("motos", {
  id: uuid("id").primaryKey().defaultRandom(),
  placa: text("placa").notNull().unique(),
  marca: text("marca").notNull(),
  kmActual: integer("km_actual").notNull(),
  kmUltimoAceite: integer("km_ultimo_aceite").notNull().default(0),
  domiciliarioId: uuid("domiciliario_id")
    .notNull()
    .unique()
    .references(() => domiciliarios.id),
});

export const planes = pgTable("planes", {
  id: uuid("id").primaryKey().defaultRandom(),
  codigo: text("codigo").notNull().unique(),
  nombre: text("nombre").notNull(),
  precioMensual: integer("precio_mensual").notNull(),
  incluye: text("incluye").array().notNull(),
  noIncluye: text("no_incluye").array().notNull(),
});

export const suscripciones = pgTable("suscripciones", {
  id: uuid("id").primaryKey().defaultRandom(),
  activa: boolean("activa").notNull().default(true),
  desde: timestamp("desde").notNull().defaultNow(),
  domiciliarioId: uuid("domiciliario_id")
    .notNull()
    .references(() => domiciliarios.id),
  planId: uuid("plan_id")
    .notNull()
    .references(() => planes.id),
});

export const mecanicos = pgTable("mecanicos", {
  id: uuid("id").primaryKey().defaultRandom(),
  nombre: text("nombre").notNull(),
  celular: text("celular").notNull().unique(),
  aniosExperiencia: integer("anios_experiencia").notNull(),
  verificado: boolean("verificado").notNull().default(false),
});

export const visitas = pgTable("visitas", {
  id: uuid("id").primaryKey().defaultRandom(),
  direccion: text("direccion").notNull(),
  fecha: timestamp("fecha").notNull(),
  franja: franja("franja").notNull(),
  servicio: servicio("servicio").notNull(),
  estado: estadoVisita("estado").notNull().default("PENDIENTE"),
  trabajoRealizado: text("trabajo_realizado"),
  kmCierre: integer("km_cierre"),
  calificacion: integer("calificacion"),
  creadaEn: timestamp("creada_en").notNull().defaultNow(),
  motoId: uuid("moto_id")
    .notNull()
    .references(() => motos.id),
  mecanicoId: uuid("mecanico_id").references(() => mecanicos.id),
});
