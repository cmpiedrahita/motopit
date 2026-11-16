import { describe, expect, it } from "vitest";
import { cambiarEstado, puedeCambiarEstado } from "./visitas";

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
