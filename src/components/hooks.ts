"use client";
// Hooks de las pantallas: sesión (localStorage) y carga de datos desde la API.
import { useCallback, useEffect, useState } from "react";
import { pedir } from "@/lib/cliente";
import { borrarSesion, CLAVE_DOMICILIARIO, guardarSesion, leerSesion, type ClaveSesion } from "@/lib/sesion";
import type { Perfil } from "@/lib/tipos";
import type { Errores } from "@/lib/validacion";

/** id guardado en localStorage. `undefined` mientras se lee (evita parpadeos al cargar). */
export function useSesion(clave: ClaveSesion) {
  const [id, setId] = useState<string | null | undefined>(undefined);
  useEffect(() => setId(leerSesion(clave)), [clave]);
  const guardar = useCallback(
    (valor: string) => {
      guardarSesion(clave, valor);
      setId(valor);
    },
    [clave],
  );
  const borrar = useCallback(() => {
    borrarSesion(clave);
    setId(null);
  }, [clave]);
  return { id, guardar, borrar };
}

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
 * Perfil del domiciliario guardado en la sesión.
 * Si el id ya no existe en la base de datos (404), se borra la sesión.
 */
export function usePerfil() {
  const sesion = useSesion(CLAVE_DOMICILIARIO);
  const perfil = useDatos<Perfil>(sesion.id ? `/api/domiciliarios/${sesion.id}` : null);
  const { borrar } = sesion;

  useEffect(() => {
    if (perfil.status === 404) borrar();
  }, [perfil.status, borrar]);

  return {
    domiciliarioId: sesion.id,
    salir: sesion.borrar,
    perfil: perfil.datos,
    errores: perfil.errores,
    // Cargando mientras se lee la sesión o mientras llega el perfil.
    cargando: sesion.id === undefined || (!!sesion.id && perfil.cargando && !perfil.datos),
    recargar: perfil.recargar,
  };
}
