import { describe, expect, it } from "vitest";
import { planearCambioDePlan, validarEleccionPlan } from "./planes";

const BASICO = "6f1c2c1e-3a2b-4c1d-9e8f-0a1b2c3d4e5f";
const FULL = "7a2d3e4f-5b6c-4d7e-8f90-1a2b3c4d5e6f";
const DOMI = "8b3e4f5a-6c7d-4e8f-9a01-2b3c4d5e6f70";

describe("HU-02: elegir plan mensual", () => {
  it("al elegir un plan sin tener ninguno, se crea la suscripción activa", () => {
    expect(planearCambioDePlan([], BASICO)).toEqual({ desactivar: [], crear: true });
  });

  it("elegir otro plan desactiva el anterior (solo un plan activo a la vez)", () => {
    const actuales = [{ id: "s1", planId: BASICO, activa: true }];
    expect(planearCambioDePlan(actuales, FULL)).toEqual({ desactivar: ["s1"], crear: true });
  });

  it("elegir el plan que ya está activo no crea otra suscripción", () => {
    const actuales = [{ id: "s1", planId: FULL, activa: true }];
    expect(planearCambioDePlan(actuales, FULL)).toEqual({ desactivar: [], crear: false });
  });

  it("las suscripciones ya inactivas no se tocan", () => {
    const actuales = [
      { id: "s1", planId: BASICO, activa: false },
      { id: "s2", planId: FULL, activa: true },
    ];
    expect(planearCambioDePlan(actuales, BASICO)).toEqual({ desactivar: ["s2"], crear: true });
  });

  it("exige un plan válido", () => {
    const r = validarEleccionPlan({ domiciliarioId: DOMI });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errores.planId).toBe("Elige un plan");
    expect(validarEleccionPlan({ domiciliarioId: DOMI, planId: BASICO }).ok).toBe(true);
  });
});
