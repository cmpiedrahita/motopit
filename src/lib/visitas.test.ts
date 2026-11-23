import { describe, expect, it } from "vitest";
import { aceptarVisita, cambiarEstado, clasificarParaMecanico, puedeCambiarEstado, validarCierre } from "./visitas";

describe("ciclo de vida de una visita", () => {
  it("una visita pendiente puede ser aceptada por un mecánico", () => {
    expect(cambiarEstado("PENDIENTE", "ASIGNADA")).toBe("ASIGNADA");
  });

  it("una visita asignada puede completarse", () => {
    expect(cambiarEstado("ASIGNADA", "COMPLETADA")).toBe("COMPLETADA");
  });

  it("no se puede completar una visita que nadie ha aceptado", () => {
    expect(puedeCambiarEstado("PENDIENTE", "COMPLETADA")).toBe(false);
    expect(() => cambiarEstado("PENDIENTE", "COMPLETADA")).toThrow();
  });

  it("una visita completada ya no cambia", () => {
    expect(puedeCambiarEstado("COMPLETADA", "ASIGNADA")).toBe(false);
    expect(puedeCambiarEstado("COMPLETADA", "CANCELADA")).toBe(false);
  });
});

describe("HU-04: el mecánico ve y acepta visitas pendientes", () => {
  const visitas = [
    { id: "v1", estado: "PENDIENTE" as const, mecanicoId: null },
    { id: "v2", estado: "ASIGNADA" as const, mecanicoId: "m1" },
    { id: "v3", estado: "ASIGNADA" as const, mecanicoId: "m2" },
    { id: "v4", estado: "COMPLETADA" as const, mecanicoId: "m1" },
  ];

  it("el mecánico ve la lista de visitas pendientes", () => {
    expect(clasificarParaMecanico(visitas, "m1").pendientes.map((v) => v.id)).toEqual(["v1"]);
  });

  it("al aceptar, la visita pasa a ASIGNADA con su nombre", () => {
    expect(aceptarVisita({ estado: "PENDIENTE", mecanicoId: null }, "m1")).toEqual({ estado: "ASIGNADA", mecanicoId: "m1" });
  });

  it("una visita asignada no aparece para otro mecánico", () => {
    const { pendientes, asignadas } = clasificarParaMecanico(visitas, "m1");
    expect([...pendientes, ...asignadas].map((v) => v.id)).not.toContain("v3");
    expect(asignadas.map((v) => v.id)).toEqual(["v2"]);
  });

  it("una visita no se puede aceptar dos veces", () => {
    expect(() => aceptarVisita({ estado: "ASIGNADA", mecanicoId: "m2" }, "m1")).toThrow();
  });
});

describe("HU-06: cerrar visita con trabajo y km", () => {
  it("al cerrar se exigen trabajo realizado y km", () => {
    const r = validarCierre({}, 10000);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errores.trabajoRealizado).toBe("Describe el trabajo realizado");
      expect(r.errores.km).toBe("Escribe el kilometraje de la moto");
    }
  });

  it("el km no puede ser menor al km actual de la moto", () => {
    const r = validarCierre({ trabajoRealizado: "Cambio de aceite 20W-50", km: 9990 }, 10000);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errores.km).toMatch(/no puede ser menor/);
  });

  it("con trabajo y km iguales o mayores al actual el cierre es válido", () => {
    expect(validarCierre({ trabajoRealizado: "Cambio de aceite 20W-50", km: "10000" }, 10000)).toEqual({
      ok: true,
      datos: { trabajoRealizado: "Cambio de aceite 20W-50", km: 10000 },
    });
  });
});
