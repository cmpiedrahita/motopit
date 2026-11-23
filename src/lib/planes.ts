// HU-02: elegir plan mensual. Regla: solo un plan activo a la vez.
import { z } from "zod";
import { validar } from "./validacion";

export type SuscripcionActual = { id: string; planId: string; activa: boolean };

/**
 * Decide qué hacer cuando el domiciliario elige un plan:
 * - desactivar todas las suscripciones activas que no sean de ese plan,
 * - crear una nueva solo si ese plan no estaba ya activo.
 */
export function planearCambioDePlan(actuales: SuscripcionActual[], nuevoPlanId: string) {
  const activas = actuales.filter((s) => s.activa);
  const yaActivo = activas.some((s) => s.planId === nuevoPlanId);
  return {
    desactivar: activas.filter((s) => s.planId !== nuevoPlanId).map((s) => s.id),
    crear: !yaActivo,
  };
}

const esquemaEleccion = z.object({
  domiciliarioId: z.uuid("Falta el domiciliario"),
  planId: z.uuid("Elige un plan"),
});

export function validarEleccionPlan(datos: unknown) {
  return validar(esquemaEleccion, datos);
}
