// HU-01: registro del domiciliario con su moto.
// Reglas puras: validan los datos del formulario antes de tocar la base de datos.
import { z } from "zod";
import { entero, texto, validar, type Errores } from "./validacion";

/** Placa de moto colombiana: 3 letras, 2 números y 1 letra (ABC12D). */
export const PLACA_MOTO = /^[A-Z]{3}\d{2}[A-Z]$/;

/** Celular colombiano: 10 dígitos que empiezan por 3. */
export const CELULAR = /^3\d{9}$/;

/** PIN de ingreso (HU-18): 4 números. */
export const PIN = /^\d{4}$/;
export const MENSAJE_PIN = "El PIN debe tener 4 números";

/** Quita espacios y guiones y pasa a mayúsculas: "abc-12d" → "ABC12D". */
export function normalizarPlaca(placa: string): string {
  return placa.replace(/[\s-]/g, "").toUpperCase();
}

export function normalizarCelular(celular: string): string {
  return celular.replace(/[\s-]/g, "");
}

const esquemaRegistro = z
  .object({
    nombre: texto("Escribe tu nombre").pipe(z.string().min(3, "El nombre debe tener al menos 3 letras")),
    celular: z.preprocess(
      (v) => (typeof v === "string" ? normalizarCelular(v) : v),
      texto("Escribe tu celular").pipe(z.string().regex(CELULAR, "El celular debe tener 10 dígitos y empezar por 3")),
    ),
    placa: z.preprocess(
      (v) => (typeof v === "string" ? normalizarPlaca(v) : v),
      texto("Escribe la placa de tu moto").pipe(
        z.string().regex(PLACA_MOTO, "La placa debe tener el formato de moto colombiana, por ejemplo ABC12D"),
      ),
    ),
    marca: texto("Escribe la marca de tu moto"),
    km: entero("Escribe el kilometraje de tu moto", "El kilometraje debe ser un número entero").pipe(
      z.number().min(0, "El kilometraje no puede ser negativo"),
    ),
    // HU-18: PIN para volver a entrar.
    pin: z.string({ error: "Crea un PIN de 4 números" }).regex(PIN, MENSAJE_PIN),
    confirmarPin: z.string({ error: "Repite tu PIN" }),
  })
  .refine((d) => d.pin === d.confirmarPin, { path: ["confirmarPin"], message: "Los PIN no coinciden" });

export type DatosRegistro = z.output<typeof esquemaRegistro>;

export function validarRegistro(datos: unknown) {
  return validar(esquemaRegistro, datos);
}

/** Mensajes cuando la placa o el celular ya existen (se consultan en la base de datos). */
export function erroresDuplicados(existe: { placa: boolean; celular: boolean }): Errores | null {
  const errores: Errores = {};
  if (existe.celular) errores.celular = "Este celular ya está registrado";
  if (existe.placa) errores.placa = "Esta placa ya está registrada";
  return Object.keys(errores).length ? errores : null;
}
