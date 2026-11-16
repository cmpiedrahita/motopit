import { describe, expect, it } from "vitest";
import { revisarSalud } from "./health";

describe("comprobación de salud", () => {
  it("reporta ok cuando la base de datos responde", async () => {
    const salud = await revisarSalud(async () => 1, "abc1234");
    expect(salud).toMatchObject({ status: "ok", db: "up", version: "abc1234" });
  });

  it("reporta degradado cuando la base de datos falla", async () => {
    const salud = await revisarSalud(async () => {
      throw new Error("sin conexión");
    });
    expect(salud.status).toBe("degradado");
    expect(salud.db).toBe("down");
  });
});
