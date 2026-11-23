import { describe, expect, it } from "vitest";
import { fechaADate, formatearKm, formatearPesos, hoyEnBogota } from "./formato";

describe("formatos de pantalla", () => {
  it("muestra los precios en pesos colombianos sin decimales", () => {
    expect(formatearPesos(45000)).toMatch(/^\$ ?45\.000$/);
  });

  it("muestra el kilometraje con separador de miles", () => {
    expect(formatearKm(12345)).toBe("12.345 km");
  });

  it("calcula el día de hoy en hora de Colombia", () => {
    // 2 a. m. UTC del 24 = 9 p. m. del 23 en Bogotá
    expect(hoyEnBogota(new Date("2026-11-24T02:00:00Z"))).toBe("2026-11-23");
  });

  it("guarda la fecha a mediodía UTC para que no cambie de día", () => {
    expect(fechaADate("2026-11-25").toISOString()).toBe("2026-11-25T12:00:00.000Z");
  });
});
