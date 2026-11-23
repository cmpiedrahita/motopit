// Tarjeta con los datos básicos de una visita. Cada pantalla agrega lo suyo como `children`.
import type { ReactNode } from "react";
import { FRANJAS, SERVICIOS, formatearFecha } from "@/lib/formato";
import type { VisitaDetalle } from "@/lib/tipos";
import { Icono, type NombreIcono } from "./Icono";
import { Dato, EstadoBadge } from "./ui";

const iconoServicio: Record<VisitaDetalle["servicio"], NombreIcono> = {
  CAMBIO_ACEITE: "gota",
  FRENOS: "freno",
  CADENA: "cadena",
  REVISION_GENERAL: "llave",
};

export function TarjetaVisita({
  visita,
  children,
  mostrarEstado = true,
}: {
  visita: VisitaDetalle;
  children?: ReactNode;
  mostrarEstado?: boolean;
}) {
  return (
    <article className="tarjeta">
      <div className="fila">
        <div className="fila-inicio">
          <span className="beneficio-icono" style={{ width: 38, height: 38, borderRadius: 12 }}>
            <Icono nombre={iconoServicio[visita.servicio]} />
          </span>
          <h3>{SERVICIOS[visita.servicio]}</h3>
        </div>
        {mostrarEstado && <EstadoBadge estado={visita.estado} />}
      </div>
      <Dato icono="calendario">
        {formatearFecha(visita.fecha)} · {FRANJAS[visita.franja]}
      </Dato>
      <Dato icono="pin">{visita.direccion}</Dato>
      {children}
    </article>
  );
}
