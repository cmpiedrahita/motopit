"use client";
// HU-18: estado de sesión para todas las pantallas. La sesión vive en cookies httpOnly
// (el navegador no las puede leer), así que se le pregunta al servidor con GET /api/sesion.
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Rol } from "@/lib/auth";
import { pedir } from "@/lib/cliente";

type EstadoSesion = {
  /** `undefined` mientras se consulta al servidor. */
  domiciliarioId: string | null | undefined;
  mecanicoId: string | null | undefined;
  refrescar: () => Promise<void>;
  salir: (rol: Rol) => Promise<void>;
};

const Contexto = createContext<EstadoSesion | null>(null);

export function SesionProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<{ domiciliarioId?: string | null; mecanicoId?: string | null }>({});

  const refrescar = useCallback(async () => {
    const r = await pedir<{ domiciliarioId: string | null; mecanicoId: string | null }>("/api/sesion");
    setIds(r.ok ? r.datos : { domiciliarioId: null, mecanicoId: null });
  }, []);

  const salir = useCallback(
    async (rol: Rol) => {
      await pedir(`/api/sesion?rol=${rol}`, { metodo: "DELETE" });
      await refrescar();
    },
    [refrescar],
  );

  useEffect(() => {
    refrescar();
  }, [refrescar]);

  return (
    <Contexto.Provider value={{ domiciliarioId: ids.domiciliarioId, mecanicoId: ids.mecanicoId, refrescar, salir }}>
      {children}
    </Contexto.Provider>
  );
}

export function useSesion() {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error("useSesion debe usarse dentro de <SesionProvider>");
  return contexto;
}
