"use client";
// HU-09: historial de mantenimientos — visitas completadas, de la más reciente a la más antigua.
import Link from "next/link";
import { useDatos, usePerfil } from "@/components/hooks";
import { TarjetaVisita } from "@/components/TarjetaVisita";
import { Aviso, Dato, ErrorGeneral, Esqueleto, Placa, Vacio } from "@/components/ui";
import { formatearKm } from "@/lib/formato";
import { historialDeMantenimiento } from "@/lib/mantenimiento";
import type { VisitaDetalle } from "@/lib/tipos";

export default function Historial() {
  const { domiciliarioId, perfil, cargando } = usePerfil();
  const visitas = useDatos<VisitaDetalle[]>(domiciliarioId ? "/api/visitas" : null);

  if (cargando || (visitas.cargando && !visitas.datos)) return <Esqueleto bloques={[60, 90, 160, 160]} />;
  if (!domiciliarioId || !perfil) {
    return (
      <Aviso tipo="info" titulo="Primero registra tu moto">
        <Link className="boton pequeno" href="/registro">
          Registrar mi moto
        </Link>
      </Aviso>
    );
  }

  const historial = historialDeMantenimiento(visitas.datos ?? []);

  return (
    <>
      <div className="fila" style={{ alignItems: "flex-end", marginBottom: 20 }}>
        <div>
          <p className="etiqueta-seccion">Tu libreta digital</p>
          <h1 style={{ margin: 0 }}>Historial</h1>
        </div>
        <Placa placa={perfil.moto.placa} pequena />
      </div>
      <ErrorGeneral mensaje={visitas.errores?.general} />

      <div className="resumen">
        <div className="tarjeta">
          <p className="etiqueta-seccion">Mantenimientos</p>
          <div className="cifra">{historial.length}</div>
        </div>
        <div className="tarjeta">
          <p className="etiqueta-seccion">Último aceite</p>
          <div className="cifra">{formatearKm(perfil.moto.kmUltimoAceite)}</div>
        </div>
      </div>

      {historial.length === 0 ? (
        <Vacio icono="reloj" titulo="Aún no hay mantenimientos">
          <p className="meta">Cuando un mecánico cierre una visita, quedará registrada aquí con la fecha, el trabajo y el km.</p>
        </Vacio>
      ) : (
        <div className="linea-tiempo pila">
          {historial.map((v) => (
            <div key={v.id} className="hito">
              <TarjetaVisita visita={v} mostrarEstado={false}>
                <hr className="separador" />
                <p style={{ margin: 0, lineHeight: 1.45 }}>{v.trabajoRealizado}</p>
                {v.kmCierre !== null && <Dato icono="velocimetro">{formatearKm(v.kmCierre)}</Dato>}
                {v.mecanico && <Dato icono="usuario">{v.mecanico.nombre}</Dato>}
              </TarjetaVisita>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
