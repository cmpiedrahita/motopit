import { describe, expect, it } from "vitest";
import { erroresDuplicados, normalizarPlaca, validarRegistro } from "./registro";

const valido = { nombre: "Andrea López", celular: "3001234567", placa: "ABC12D", marca: "Yamaha", km: "15000" };

describe("HU-01: registro del domiciliario con su moto", () => {
  it("con nombre, celular, placa, marca y km válidos el registro es aceptado", () => {
    const r = validarRegistro(valido);
    expect(r).toEqual({ ok: true, datos: { ...valido, km: 15000 } });
  });

  it("una placa ya registrada muestra un error", () => {
    expect(erroresDuplicados({ placa: true, celular: false })).toEqual({ placa: "Esta placa ya está registrada" });
  });

  it("un celular ya registrado muestra un error", () => {
    expect(erroresDuplicados({ placa: false, celular: true })).toEqual({ celular: "Este celular ya está registrado" });
  });

  it("sin duplicados no hay errores", () => {
    expect(erroresDuplicados({ placa: false, celular: false })).toBeNull();
  });

  it("rechaza un kilometraje negativo", () => {
    const r = validarRegistro({ ...valido, km: -5 });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errores.km).toBe("El kilometraje no puede ser negativo");
  });

  it("rechaza un kilometraje vacío", () => {
    const r = validarRegistro({ ...valido, km: "" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errores.km).toBe("Escribe el kilometraje de tu moto");
  });

  it("valida la placa con formato de moto colombiana (ABC12D)", () => {
    for (const placa of ["ABC123", "AB12CD", "ABCD12", "123ABC"]) {
      const r = validarRegistro({ ...valido, placa });
      expect(r.ok, placa).toBe(false);
      if (!r.ok) expect(r.errores.placa).toMatch(/formato de moto colombiana/);
    }
  });

  it("acepta la placa en minúsculas o con guion y la guarda normalizada", () => {
    expect(normalizarPlaca("abc-12d")).toBe("ABC12D");
    const r = validarRegistro({ ...valido, placa: "abc 12d" });
    expect(r.ok && r.datos.placa).toBe("ABC12D");
  });

  it("rechaza un celular que no tiene 10 dígitos", () => {
    const r = validarRegistro({ ...valido, celular: "30012" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errores.celular).toMatch(/10 dígitos/);
  });

  it("muestra un error por cada campo vacío", () => {
    const r = validarRegistro({});
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errores).sort()).toEqual(["celular", "km", "marca", "nombre", "placa"]);
  });
});
