import { describe, expect, it } from "vitest";
import { esDuplicado, esUuid, leerCuerpo, noEncontrado } from "./api";

describe("ayudas de la API", () => {
  it("reconoce un UUID válido", () => {
    expect(esUuid("8b3e4f5a-6c7d-4e8f-9a01-2b3c4d5e6f70")).toBe(true);
  });

  it.each(["abc", undefined, 15])("rechaza el UUID inválido %s", (valor) => {
    expect(esUuid(valor)).toBe(false);
  });

  it("detecta una violación de unicidad directa o anidada", () => {
    expect(esDuplicado({ code: "23505" })).toBe(true);
    expect(esDuplicado({ cause: { code: "23505" } })).toBe(true);
  });

  it("descarta otros errores y valores nulos", () => {
    expect(esDuplicado({ code: "23503" })).toBe(false);
    expect(esDuplicado(null)).toBe(false);
  });

  it("lee el objeto JSON de la solicitud", async () => {
    const req = new Request("http://localhost", { method: "POST", body: JSON.stringify({ a: 1 }) });
    expect(await leerCuerpo(req)).toEqual({ a: 1 });
  });

  it.each(["esto no es json", "null", "15"])("devuelve un objeto vacío para el cuerpo %s", async (body) => {
    const req = new Request("http://localhost", { method: "POST", body });
    expect(await leerCuerpo(req)).toEqual({});
  });

  it("responde 404 con un error general cuando falta el recurso", async () => {
    const respuesta = noEncontrado("La visita no existe");
    expect(respuesta.status).toBe(404);
    expect(await respuesta.json()).toEqual({ errores: { general: "La visita no existe" } });
  });
});
