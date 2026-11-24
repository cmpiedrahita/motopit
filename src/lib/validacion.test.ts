import { describe, expect, it } from "vitest";
import { z } from "zod";
import { aErrores, entero, validar } from "./validacion";

describe("ayudas de validación", () => {
  it("conserva el primer mensaje de cada campo y agrupa errores sin campo", () => {
    const error = new z.ZodError([
      { code: "custom", path: ["km"], message: "Primer error" },
      { code: "custom", path: ["km"], message: "Segundo error" },
      { code: "custom", path: ["placa"], message: "Falta la placa" },
      { code: "custom", path: [], message: "Datos inválidos" },
    ]);
    expect(aErrores(error)).toEqual({ km: "Primer error", placa: "Falta la placa", general: "Datos inválidos" });
  });

  const esquema = z.object({ km: entero("Escribe el km") });

  it.each(["", null, undefined])("exige un valor si el kilometraje es %s", (km) => {
    expect(validar(esquema, { km })).toEqual({ ok: false, errores: { km: "Escribe el km" } });
  });

  it.each(["abc", "1.5"])("rechaza el kilometraje no entero %s", (km) => {
    expect(validar(esquema, { km })).toEqual({ ok: false, errores: { km: "Debe ser un número entero" } });
  });

  it.each(["15", 15])("valida y devuelve el kilometraje %s como número", (km) => {
    expect(validar(esquema, { km })).toEqual({ ok: true, datos: { km: 15 } });
  });
});
