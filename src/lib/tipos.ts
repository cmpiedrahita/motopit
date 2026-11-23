// Tipos de las respuestas de la API. Los usan las rutas (servidor) y las pantallas (cliente).
import type { Recordatorio } from "./mantenimiento";
import type { Franja, Servicio } from "./formato";
import type { EstadoVisita } from "./visitas";

export type Plan = {
  id: string;
  codigo: string;
  nombre: string;
  precioMensual: number;
  incluye: string[];
  noIncluye: string[];
};

export type MecanicoPerfil = {
  id: string;
  nombre: string;
  aniosExperiencia: number;
  verificado: boolean;
  promedio: number | null;
  totalCalificaciones: number;
};

export type Perfil = {
  domiciliario: { id: string; nombre: string; celular: string };
  moto: { id: string; placa: string; marca: string; kmActual: number; kmUltimoAceite: number };
  plan: (Pick<Plan, "id" | "codigo" | "nombre" | "precioMensual"> & { desde: string }) | null;
  recordatorio: Recordatorio;
};

export type VisitaDetalle = {
  id: string;
  direccion: string;
  fecha: string;
  franja: Franja;
  servicio: Servicio;
  estado: EstadoVisita;
  trabajoRealizado: string | null;
  kmCierre: number | null;
  calificacion: number | null;
  moto: { placa: string; marca: string; kmActual: number };
  domiciliario: { nombre: string; celular: string };
  mecanico: MecanicoPerfil | null;
};
