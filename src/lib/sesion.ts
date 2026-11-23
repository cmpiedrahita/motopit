// Sesión mínima del MVP (no hay login): los ids se guardan en localStorage.
// Siempre con try/catch: en modo privado o con el almacenamiento bloqueado, localStorage falla.

export const CLAVE_DOMICILIARIO = "motopit:domiciliarioId";
export const CLAVE_MECANICO = "motopit:mecanicoId";
export type ClaveSesion = typeof CLAVE_DOMICILIARIO | typeof CLAVE_MECANICO;

export function leerSesion(clave: ClaveSesion): string | null {
  try {
    return localStorage.getItem(clave);
  } catch {
    return null;
  }
}

export function guardarSesion(clave: ClaveSesion, valor: string) {
  try {
    localStorage.setItem(clave, valor);
  } catch {
    // Sin almacenamiento la app sigue funcionando, solo que no recuerda al usuario.
  }
}

export function borrarSesion(clave: ClaveSesion) {
  try {
    localStorage.removeItem(clave);
  } catch {
    // nada que hacer
  }
}
