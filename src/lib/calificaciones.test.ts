import { describe, expect, it } from "vitest";
import { puedeCalificar, resumenCalificaciones, resumenDe, validarCalificacion } from "./calificaciones";

const DOMI = "8b3e4f5a-6c7d-4e8f-9a01-2b3c4d5e6f70";

describe("HU-13: perfil verificado del mecánico y calificación", () => {
  it("la calificación promedio se calcula con un decimal", () => {
    const resumen = resumenCalificaciones([
      { mecanicoId: "m1", calificacion: 5 },
      { mecanicoId: "m1", calificacion: 4 },
      { mecanicoId: "m1", calificacion: 4 },
      { mecanicoId: "m2", calificacion: null },
    ]);
    expect(resumenDe(resumen, "m1")).toEqual({ promedio: 4.3, total: 3 });
  });

  it("un mecánico sin calificaciones no tiene promedio", () => {
    expect(resumenDe(resumenCalificaciones([]), "m2")).toEqual({ promedio: null, total: 0 });
  });

  it("al completar la visita el domiciliario califica de 1 a 5", () => {
    expect(validarCalificacion({ domiciliarioId: DOMI, calificacion: 5 }).ok).toBe(true);
    expect(validarCalificacion({ domiciliarioId: DOMI, calificacion: 1 }).ok).toBe(true);
  });

  it("rechaza calificaciones fuera de 1 a 5", () => {
    for (const calificacion of [0, 6, 3.5]) {
      const r = validarCalificacion({ domiciliarioId: DOMI, calificacion });
      expect(r.ok, String(calificacion)).toBe(false);
    }
  });

  it("solo se califica una visita completada y una sola vez", () => {
    expect(puedeCalificar({ estado: "COMPLETADA", calificacion: null })).toBe(true);
    expect(puedeCalificar({ estado: "COMPLETADA", calificacion: 4 })).toBe(false);
    expect(puedeCalificar({ estado: "ASIGNADA", calificacion: null })).toBe(false);
  });
});
