// Componentes visuales pequeños y reutilizables en todas las pantallas.
import type { ReactNode } from "react";
import { ESTADOS } from "@/lib/formato";
import type { EstadoVisita } from "@/lib/visitas";
import { Estrella, Icono, type NombreIcono } from "./Icono";

/** Placa amarilla de moto colombiana. */
export function Placa({ placa, pequena = false }: { placa: string; pequena?: boolean }) {
  const texto = placa ? `${placa.slice(0, 3)} ${placa.slice(3)}`.trim() : "ABC 12D";
  return (
    <span className={`placa${pequena ? " pequena" : ""}${placa ? "" : " vacia"}`} aria-label={`Placa ${placa}`}>
      <span className="placa-texto">{texto}</span>
      {!pequena && <span className="placa-pais">COLOMBIA</span>}
    </span>
  );
}

export function EstadoBadge({ estado }: { estado: EstadoVisita }) {
  return <span className={`badge badge-${estado}`}>{ESTADOS[estado]}</span>;
}

/** Etiqueta + input + error debajo del campo. */
export function Campo({
  id,
  etiqueta,
  error,
  ayuda,
  children,
}: {
  id: string;
  etiqueta: string;
  error?: string;
  ayuda?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="campo">
      <label htmlFor={id}>{etiqueta}</label>
      {children}
      {error ? (
        <p className="error" id={`${id}-error`} role="alert">
          {error}
        </p>
      ) : (
        ayuda && <p className="ayuda">{ayuda}</p>
      )}
    </div>
  );
}

const iconosAviso: Record<string, NombreIcono> = { alerta: "alerta", peligro: "alerta", info: "info", exito: "check" };

export function Aviso({
  tipo,
  titulo,
  icono,
  children,
}: {
  tipo: "alerta" | "peligro" | "info" | "exito";
  titulo: string;
  icono?: NombreIcono;
  children?: ReactNode;
}) {
  return (
    <div className={`aviso aviso-${tipo}`} role={tipo === "peligro" || tipo === "alerta" ? "alert" : "status"}>
      <span className="aviso-icono">
        <Icono nombre={icono ?? iconosAviso[tipo]} />
      </span>
      <div style={{ flex: 1 }}>
        <strong>{titulo}</strong>
        {children}
      </div>
    </div>
  );
}

export function ErrorGeneral({ mensaje }: { mensaje?: string }) {
  if (!mensaje) return null;
  return (
    <p className="error-general" role="alert">
      {mensaje}
    </p>
  );
}

export function Estrellas({ valor, tamano = 16 }: { valor: number; tamano?: number }) {
  const redondeado = Math.round(valor);
  return (
    <span className="estrellas" aria-label={`${valor} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Estrella key={n} tamano={tamano} llena={n <= redondeado} />
      ))}
    </span>
  );
}

export function Vacio({ icono, titulo, children }: { icono: NombreIcono; titulo: string; children?: ReactNode }) {
  return (
    <div className="vacio">
      <span className="vacio-icono">
        <Icono nombre={icono} tamano={26} />
      </span>
      <h3>{titulo}</h3>
      {children}
    </div>
  );
}

/** Bloques grises animados mientras carga la información. */
export function Esqueleto({ bloques = [140, 90, 90] }: { bloques?: number[] }) {
  return (
    <div className="pila" aria-busy="true" aria-label="Cargando">
      {bloques.map((alto, i) => (
        <div key={i} className="esqueleto" style={{ height: alto }} />
      ))}
    </div>
  );
}

export function Dato({ icono, children }: { icono: NombreIcono; children: ReactNode }) {
  return (
    <div className="dato">
      <Icono nombre={icono} tamano={17} />
      <span>{children}</span>
    </div>
  );
}
