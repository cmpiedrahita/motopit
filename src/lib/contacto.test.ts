import { describe, expect, it } from "vitest";
import { enlaceWhatsApp, mensajeParaMecanico, puedeContactarMecanico } from "./contacto";

describe("HU-16: escribirle al mecánico asignado por WhatsApp", () => {
  it("con la visita asignada se puede contactar al mecánico", () => {
    expect(puedeContactarMecanico("ASIGNADA")).toBe(true);
  });

  it("el enlace abre WhatsApp con el número del mecánico y el indicativo +57", () => {
    expect(enlaceWhatsApp("3001234567", "Hola")).toBe("https://wa.me/573001234567?text=Hola");
  });

  it("el mensaje incluye la placa y la fecha de la visita", () => {
    const mensaje = mensajeParaMecanico("ABC12D", "sáb 20 dic");
    expect(mensaje).toContain("ABC12D");
    expect(mensaje).toContain("sáb 20 dic");
  });

  it("el mensaje va codificado en el enlace (espacios y tildes)", () => {
    const enlace = enlaceWhatsApp("3001234567", mensajeParaMecanico("ABC12D", "sáb 20 dic"));
    expect(enlace).not.toContain(" ");
    expect(decodeURIComponent(enlace.split("?text=")[1])).toBe(mensajeParaMecanico("ABC12D", "sáb 20 dic"));
  });

  it("en visitas pendientes, completadas o canceladas no se puede contactar", () => {
    expect(puedeContactarMecanico("PENDIENTE")).toBe(false);
    expect(puedeContactarMecanico("COMPLETADA")).toBe(false);
    expect(puedeContactarMecanico("CANCELADA")).toBe(false);
  });
});
