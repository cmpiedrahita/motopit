import { describe, expect, it } from "vitest";
import { historialDeMantenimiento, motoTrasCierre, recordatorioAceite, validarNuevoKm } from "./mantenimiento";

describe("HU-07: recordatorio de cambio de aceite por km", () => {
  it("si faltan 300 km o menos para el próximo cambio aparece el aviso", () => {
    const r = recordatorioAceite(11700, 10000);
    expect(r).toMatchObject({ proximoCambioKm: 12000, faltanKm: 300, mostrarAviso: true, vencido: false });
  });

  it("si faltan más de 300 km no aparece el aviso", () => {
    expect(recordatorioAceite(11699, 10000).mostrarAviso).toBe(false);
  });

  it("si ya se pasó del km del cambio el aviso aparece como vencido", () => {
    expect(recordatorioAceite(12100, 10000)).toMatchObject({ faltanKm: -100, mostrarAviso: true, vencido: true });
  });

  it("el progreso va de 0 a 1 entre un cambio y el siguiente", () => {
    expect(recordatorioAceite(10000, 10000).progreso).toBe(0);
    expect(recordatorioAceite(11000, 10000).progreso).toBe(0.5);
    expect(recordatorioAceite(15000, 10000).progreso).toBe(1);
  });

  it("cerrar un cambio de aceite reinicia el contador del recordatorio", () => {
    expect(motoTrasCierre(12050, "CAMBIO_ACEITE", 10000)).toEqual({ kmActual: 12050, kmUltimoAceite: 12050 });
    expect(motoTrasCierre(12050, "FRENOS", 10000)).toEqual({ kmActual: 12050, kmUltimoAceite: 10000 });
  });
});

describe("HU-08: actualizar kilometraje", () => {
  it("acepta un km mayor o igual al actual", () => {
    expect(validarNuevoKm({ km: "15200" }, 15000)).toEqual({ ok: true, datos: { km: 15200 } });
  });

  it("no acepta valores menores al actual", () => {
    const r = validarNuevoKm({ km: 14999 }, 15000);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errores.km).toBe("No puede ser menor al kilometraje actual (15000)");
  });

  it("no acepta un km vacío", () => {
    const r = validarNuevoKm({ km: "" }, 15000);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errores.km).toBe("Escribe el kilometraje");
  });
});

describe("HU-09: historial de mantenimientos", () => {
  it("muestra solo las visitas completadas, de la más reciente a la más antigua", () => {
    const visitas = [
      { id: "a", estado: "COMPLETADA", fecha: "2026-09-01T12:00:00Z" },
      { id: "b", estado: "PENDIENTE", fecha: "2026-12-01T12:00:00Z" },
      { id: "c", estado: "COMPLETADA", fecha: "2026-11-01T12:00:00Z" },
      { id: "d", estado: "CANCELADA", fecha: "2026-10-01T12:00:00Z" },
    ];
    expect(historialDeMantenimiento(visitas).map((v) => v.id)).toEqual(["c", "a"]);
  });
});
