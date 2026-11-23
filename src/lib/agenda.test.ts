import { describe, expect, it } from "vitest";
import { MENSAJE_SIN_PLAN, validarAgenda } from "./agenda";

const HOY = "2026-11-23";
const solicitud = {
  domiciliarioId: "8b3e4f5a-6c7d-4e8f-9a01-2b3c4d5e6f70",
  direccion: "Calle 45 # 12-30, Chapinero",
  fecha: "2026-11-25",
  franja: "MANANA",
  servicio: "CAMBIO_ACEITE",
};

describe("HU-03: agendar visita donde está la moto", () => {
  it("con plan activo y datos completos la solicitud es válida", () => {
    const r = validarAgenda(solicitud, { tienePlanActivo: true, hoy: HOY });
    expect(r).toEqual({ ok: true, datos: solicitud });
  });

  it("sin plan activo no deja agendar y explica por qué", () => {
    const r = validarAgenda(solicitud, { tienePlanActivo: false, hoy: HOY });
    expect(r).toEqual({ ok: false, errores: { plan: MENSAJE_SIN_PLAN } });
  });

  it("no permite fechas pasadas", () => {
    const r = validarAgenda({ ...solicitud, fecha: "2026-11-22" }, { tienePlanActivo: true, hoy: HOY });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errores.fecha).toBe("La fecha no puede ser pasada");
  });

  it("permite agendar para hoy", () => {
    expect(validarAgenda({ ...solicitud, fecha: HOY }, { tienePlanActivo: true, hoy: HOY }).ok).toBe(true);
  });

  it("exige dirección, franja y servicio", () => {
    const r = validarAgenda(
      { domiciliarioId: solicitud.domiciliarioId, fecha: "2026-11-25", direccion: " ", franja: "MADRUGADA" },
      { tienePlanActivo: true, hoy: HOY },
    );
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errores.direccion).toBe("Escribe la dirección donde está la moto");
      expect(r.errores.franja).toBe("Elige una franja horaria");
      expect(r.errores.servicio).toBe("Elige el servicio");
    }
  });
});
