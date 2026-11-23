// HU-03: agendar una visita donde está la moto.
import { z } from "zod";
import { FRANJAS, SERVICIOS, type Franja, type Servicio } from "./formato";
import { texto, validar, type Resultado } from "./validacion";

export const MENSAJE_SIN_PLAN = "Necesitas un plan activo para agendar visitas. Elige un plan y vuelve a intentarlo.";

const franjas = Object.keys(FRANJAS) as [Franja, ...Franja[]];
const servicios = Object.keys(SERVICIOS) as [Servicio, ...Servicio[]];

function esquemaAgenda(hoy: string) {
  return z.object({
    domiciliarioId: z.uuid("Falta el domiciliario"),
    direccion: texto("Escribe la dirección donde está la moto").pipe(
      z.string().min(6, "Escribe una dirección más completa (calle, número y barrio)"),
    ),
    fecha: z
      .string({ error: "Elige la fecha de la visita" })
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Elige la fecha de la visita")
      // Las fechas "AAAA-MM-DD" se pueden comparar como texto.
      .refine((f) => f >= hoy, "La fecha no puede ser pasada"),
    franja: z.enum(franjas, { error: "Elige una franja horaria" }),
    servicio: z.enum(servicios, { error: "Elige el servicio" }),
  });
}

export type DatosAgenda = z.output<ReturnType<typeof esquemaAgenda>>;

/**
 * Valida una solicitud de visita.
 * @param contexto.tienePlanActivo sin plan no se puede agendar (criterio 2)
 * @param contexto.hoy fecha de hoy "AAAA-MM-DD" en Colombia (se pasa para poder probarlo)
 */
export function validarAgenda(
  datos: unknown,
  contexto: { tienePlanActivo: boolean; hoy: string },
): Resultado<DatosAgenda> {
  if (!contexto.tienePlanActivo) return { ok: false, errores: { plan: MENSAJE_SIN_PLAN } };
  return validar(esquemaAgenda(contexto.hoy), datos);
}
