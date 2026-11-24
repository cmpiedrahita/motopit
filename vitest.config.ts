import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      reporter: ["text", "html"],
      include: ["src/lib/**"],
      exclude: ["src/lib/**/*.test.ts", "src/lib/cliente.ts", "src/lib/sesion-servidor.ts", "src/lib/tipos.ts"],
      thresholds: { lines: 80, functions: 80 },
    },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
});
