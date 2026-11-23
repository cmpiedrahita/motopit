"use client";
// Hooks de las pantallas: carga de datos desde la API y perfil del domiciliario en sesión.
import { useCallback, useEffect, useState } from "react";
import { pedir } from "@/lib/cliente";
import type { Perfil } from "@/lib/tipos";
import type { Errores } from "@/lib/validacion";
import { useSesion } from "./SesionProvider";

type EstadoDatos<T> = { datos?: T; errores?: Errores; status?: number; cargando: boolean };

/** Hace GET a `url` (si no es null) y permite recargar sin perder lo que ya se mostraba. */
export function useDatos<T>(url: string | null) {
  const [estado, setEstado] = useState<EstadoDatos<T>>({ cargando: true });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!url) {
      setEstado({ cargando: false });
      return;
    }
    let vigente = true;
    setEstado((e) => ({ ...e, cargando: true }));
    pedir<T>(url).then((r) => {
      if (!vigente) return;
      setEstado(r.ok ? { datos: r.datos, cargando: false } : { errores: r.errores, status: r.status, cargando: false });
    });
    return () => {
      vigente = false;
    };
  }, [url, version]);

  const recargar = useCallback(() => setVersion((v) => v + 1), []);
  return { ...estado, recargar };
}

/**
 * Perfil del domiciliario con sesión iniciada (HU-18).
 * Si la sesión ya no es válida (401) o el usuario ya no existe (404), se cierra la sesión.
 */
export function usePerfil() {
  const { domiciliarioId, salir, refrescar } = useSesion();
  const perfil = useDatos<Perfil>(domiciliarioId ? `/api/domiciliarios/${domiciliarioId}` : null);

  useEffect(() => {
    if (perfil.status === 404) salir("domiciliario");
    if (perfil.status === 401) refrescar();
  }, [perfil.status, salir, refrescar]);

  return {
    domiciliarioId,
    salir: () => salir("domiciliario"),
    perfil: perfil.datos,
    errores: perfil.errores,
    // Cargando mientras se consulta la sesión o mientras llega el perfil.
    cargando: domiciliarioId === undefined || (!!domiciliarioId && perfil.cargando && !perfil.datos),
    recargar: perfil.recargar,
  };
}
