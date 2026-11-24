import { describe, expect, it } from "vitest";
import { hayChoqueDeFecha, MENSAJE_SIN_PLAN, validarAgenda } from "./agenda";

describe("HU-17: visitas activas en la misma fecha", () => {
  const fecha = "2026-11-25T12:00:00Z";

  it.each(["PENDIENTE", "ASIGNADA"])("detecta una visita %s el mismo día", (estado) => {
    expect(hayChoqueDeFecha([{ estado, fecha }], "2026-11-25")).toBe(true);
  });

  it.each(["CANCELADA", "COMPLETADA"])("permite otra visita si la anterior está %s", (estado) => {
    expect(hayChoqueDeFecha([{ estado, fecha }], "2026-11-25")).toBe(false);
  });

  it("permite agendar en otro día", () => {
    expect(hayChoqueDeFecha([{ estado: "PENDIENTE", fecha }], "2026-11-26")).toBe(false);
  });

  it("compara el día en Colombia aunque en UTC ya sea el siguiente", () => {
    const fecha = new Date("2026-11-26T03:00:00Z");
    expect(hayChoqueDeFecha([{ estado: "ASIGNADA", fecha }], "2026-11-25")).toBe(true);
  });
});

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
