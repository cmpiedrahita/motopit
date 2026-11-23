import { describe, expect, it } from "vitest";
import {
  BLOQUEO_MS,
  DURACION_SESION_MS,
  MAX_INTENTOS,
  cifrarPin,
  crearToken,
  estaBloqueado,
  leerToken,
  trasIntentoFallido,
  validarIngreso,
  verificarPin,
} from "./auth";

const SECRETO = "secreto-de-prueba";
const ID = "8b3e4f5a-6c7d-4e8f-9a01-2b3c4d5e6f70";

describe("HU-18: ingreso con celular y PIN", () => {
  it("el PIN se guarda cifrado, nunca en texto plano", () => {
    const guardado = cifrarPin("4821");
    expect(guardado).not.toContain("4821");
    expect(guardado.startsWith("scrypt$")).toBe(true);
    // Con sal aleatoria, el mismo PIN da un resultado distinto cada vez.
    expect(cifrarPin("4821")).not.toBe(guardado);
  });

  it("con el PIN correcto deja entrar y con otro no", () => {
    const guardado = cifrarPin("4821");
    expect(verificarPin("4821", guardado)).toBe(true);
    expect(verificarPin("4822", guardado)).toBe(false);
  });

  it("una cuenta sin PIN no deja entrar", () => {
    expect(verificarPin("1234", null)).toBe(false);
    expect(verificarPin("1234", "texto-cualquiera")).toBe(false);
  });

  it("la sesión guarda el rol y el id del usuario", () => {
    const token = crearToken({ rol: "domiciliario", id: ID }, SECRETO, 1000);
    expect(leerToken(token, SECRETO, 2000)).toEqual({ rol: "domiciliario", id: ID, exp: 1000 + DURACION_SESION_MS });
  });

  it("una sesión modificada no es válida (no se puede suplantar a otro usuario)", () => {
    const token = crearToken({ rol: "mecanico", id: ID }, SECRETO);
    const [, firma] = token.split(".");
    const cuerpoFalso = Buffer.from(JSON.stringify({ rol: "mecanico", id: "otro-id", exp: Date.now() + 1e9 })).toString("base64url");
    expect(leerToken(`${cuerpoFalso}.${firma}`, SECRETO)).toBeNull();
    expect(leerToken(token, "otro-secreto")).toBeNull();
    expect(leerToken("basura", SECRETO)).toBeNull();
    expect(leerToken(undefined, SECRETO)).toBeNull();
  });

  it("la sesión vence a los 30 días", () => {
    const token = crearToken({ rol: "domiciliario", id: ID }, SECRETO, 0);
    expect(leerToken(token, SECRETO, DURACION_SESION_MS - 1)).not.toBeNull();
    expect(leerToken(token, SECRETO, DURACION_SESION_MS + 1)).toBeNull();
  });

  it(`tras ${MAX_INTENTOS} intentos fallidos la cuenta se bloquea 15 minutos`, () => {
    const ahora = new Date("2026-11-23T15:00:00Z");
    let estado: { intentosFallidos: number; bloqueadoHasta: Date | null } = { intentosFallidos: 0, bloqueadoHasta: null };
    for (let i = 1; i < MAX_INTENTOS; i++) {
      estado = trasIntentoFallido(estado.intentosFallidos, ahora);
      expect(estado).toEqual({ intentosFallidos: i, bloqueadoHasta: null });
    }
    estado = trasIntentoFallido(estado.intentosFallidos, ahora);
    expect(estado.bloqueadoHasta?.getTime()).toBe(ahora.getTime() + BLOQUEO_MS);
    expect(estaBloqueado(estado.bloqueadoHasta, ahora)).toBe(true);
    expect(estaBloqueado(estado.bloqueadoHasta, new Date(ahora.getTime() + BLOQUEO_MS + 1))).toBe(false);
  });

  it("el formulario exige celular válido y PIN de 4 números", () => {
    const r = validarIngreso({ rol: "domiciliario", celular: "123", pin: "12a" });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errores.celular).toMatch(/10 dígitos/);
      expect(r.errores.pin).toBe("El PIN debe tener 4 números");
    }
    expect(validarIngreso({ rol: "mecanico", celular: "300 000 0001", pin: "1234" })).toEqual({
      ok: true,
      datos: { rol: "mecanico", celular: "3000000001", pin: "1234" },
    });
  });
});
