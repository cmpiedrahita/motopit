"use client";
// Inicio del domiciliario registrado: moto, km (HU-08), recordatorio de aceite (HU-07),
// plan activo (HU-02) y su próxima visita (HU-05).
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { pedir } from "@/lib/cliente";
import { FRANJAS, SERVICIOS, formatearFecha, formatearKm, formatearPesos } from "@/lib/formato";
import { INTERVALO_ACEITE_KM, type Recordatorio } from "@/lib/mantenimiento";
import type { Perfil, VisitaDetalle } from "@/lib/tipos";
import { RutaAceite } from "../escenas";
import { useDatos } from "../hooks";
import { Icono, type NombreIcono } from "../Icono";
import { Aviso, Campo, EstadoBadge, Placa } from "../ui";

export function Panel({ perfil, onCambio, onSalir }: { perfil: Perfil; onCambio: () => void; onSalir: () => void }) {
  const primerNombre = perfil.domiciliario.nombre.split(" ")[0];
  return (
    <>
      <div className="saludo">
        <p className="etiqueta-seccion">Tu panel</p>
        <h1>Hola, {primerNombre}</h1>
      </div>

      <div className="pila">
        {perfil.recordatorio.mostrarAviso && <AvisoAceite recordatorio={perfil.recordatorio} />}
        {!perfil.plan && (
          <Aviso tipo="info" titulo="Aún no tienes un plan" icono="etiqueta">
            <p>Elige un plan mensual para poder agendar visitas a domicilio.</p>
            <Link className="boton pequeno" href="/planes">
              Elegir plan
            </Link>
          </Aviso>
        )}
        <TarjetaMoto perfil={perfil} onCambio={onCambio} />
        <TarjetaAceite recordatorio={perfil.recordatorio} />
        <ProximaVisita domiciliarioId={perfil.domiciliario.id} />
        {perfil.plan && (
          <div className="tarjeta fila">
            <div>
              <p className="etiqueta-seccion">Tu plan</p>
              <h3>{perfil.plan.nombre}</h3>
              <p className="meta" style={{ margin: "2px 0 0" }}>
                {formatearPesos(perfil.plan.precioMensual)} al mes · activo desde {formatearFecha(perfil.plan.desde)}
              </p>
            </div>
            <Link className="boton secundario pequeno" href="/planes">
              Cambiar
            </Link>
          </div>
        )}
      </div>

      <h2>Accesos rápidos</h2>
      <div className="accesos">
        <Acceso href="/agendar" icono="calendario" texto="Agendar visita" />
        <Acceso href="/visitas" icono="lista" texto="Mis visitas" />
        <Acceso href="/historial" icono="reloj" texto="Historial" />
        <Acceso href="/planes" icono="etiqueta" texto="Planes" />
      </div>

      <p className="pie">
        ¿No eres {primerNombre}?{" "}
        <button className="enlace" onClick={onSalir}>
          Salir
        </button>
      </p>
    </>
  );
}

function Acceso({ href, icono, texto }: { href: string; icono: NombreIcono; texto: string }) {
  return (
    <Link className="acceso" href={href}>
      <span>
        <Icono nombre={icono} />
      </span>
      <span>{texto}</span>
    </Link>
  );
}

// HU-07: aviso con botón para agendar cuando faltan 300 km o menos.
function AvisoAceite({ recordatorio }: { recordatorio: Recordatorio }) {
  const titulo = recordatorio.vencido ? "Tu cambio de aceite está vencido" : "Te toca cambio de aceite";
  const detalle = recordatorio.vencido
    ? `Te pasaste ${formatearKm(-recordatorio.faltanKm)} del cambio (tocaba a los ${formatearKm(recordatorio.proximoCambioKm)}).`
    : `Faltan ${formatearKm(recordatorio.faltanKm)} para el próximo cambio (a los ${formatearKm(recordatorio.proximoCambioKm)}).`;
  return (
    <Aviso tipo={recordatorio.vencido ? "peligro" : "alerta"} titulo={titulo} icono="gota">
      <p>{detalle}</p>
      <Link className="boton pequeno" href="/agendar?servicio=CAMBIO_ACEITE">
        <Icono nombre="calendario" tamano={16} /> Agendar cambio de aceite
      </Link>
    </Aviso>
  );
}

function TarjetaAceite({ recordatorio }: { recordatorio: Recordatorio }) {
  const estado = recordatorio.vencido ? "vencido" : recordatorio.mostrarAviso ? "cerca" : "ok";
  return (
    <div className="tarjeta">
      <div className="fila">
        <div className="fila-inicio">
          <Icono nombre="gota" />
          <h3>Próximo cambio de aceite</h3>
        </div>
        <strong style={{ whiteSpace: "nowrap" }}>{formatearKm(recordatorio.proximoCambioKm)}</strong>
      </div>
      <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(recordatorio.progreso * 100)}>
        <RutaAceite progreso={recordatorio.progreso} estado={estado} />
      </div>
      <p className="meta" style={{ margin: 0 }}>
        {recordatorio.faltanKm > 0
          ? `Faltan ${formatearKm(recordatorio.faltanKm)} · cambio cada ${formatearKm(INTERVALO_ACEITE_KM)}`
          : "Ya pasaste el kilometraje del cambio"}
      </p>
    </div>
  );
}

// HU-08: actualizar el kilometraje en un paso.
function TarjetaMoto({ perfil, onCambio }: { perfil: Perfil; onCambio: () => void }) {
  const [editando, setEditando] = useState(false);
  const [km, setKm] = useState("");
  const [error, setError] = useState<string>();
  const [enviando, setEnviando] = useState(false);

  async function guardar(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    const r = await pedir(`/api/motos/${perfil.moto.id}`, { metodo: "PATCH", cuerpo: { km } });
    setEnviando(false);
    if (!r.ok) return setError(r.errores.km ?? r.errores.general);
    setEditando(false);
    setKm("");
    setError(undefined);
    onCambio();
  }

  return (
    <div className="tarjeta tarjeta-moto">
      <div className="fila">
        <Placa placa={perfil.moto.placa} />
        <span className="meta">{perfil.moto.marca}</span>
      </div>
      <hr className="separador" style={{ background: "#2d313a" }} />
      <div className="fila">
        <div>
          <p className="meta" style={{ margin: 0 }}>
            Kilometraje actual
          </p>
          <div className="km-grande">{formatearKm(perfil.moto.kmActual)}</div>
        </div>
        {!editando && (
          <button className="boton pequeno" onClick={() => setEditando(true)}>
            <Icono nombre="velocimetro" tamano={16} /> Actualizar
          </button>
        )}
      </div>
      {editando && (
        <form onSubmit={guardar} className="formulario" style={{ marginTop: 14 }} noValidate>
          <Campo id="km" etiqueta="Nuevo kilometraje" error={error}>
            <input
              id="km"
              type="number"
              inputMode="numeric"
              min={perfil.moto.kmActual}
              placeholder={`Mínimo ${perfil.moto.kmActual}`}
              value={km}
              onChange={(e) => setKm(e.target.value)}
              aria-invalid={!!error}
              autoFocus
            />
          </Campo>
          <div className="fila">
            <button
              type="button"
              className="boton secundario"
              onClick={() => {
                setEditando(false);
                setError(undefined);
              }}
            >
              Cancelar
            </button>
            <button className="boton" disabled={enviando}>
              {enviando ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// HU-05: la visita activa más próxima, con su estado.
function ProximaVisita({ domiciliarioId }: { domiciliarioId: string }) {
  const { datos: visitas } = useDatos<VisitaDetalle[]>(`/api/visitas?domiciliarioId=${domiciliarioId}`);
  const proxima = visitas
    ?.filter((v) => v.estado === "PENDIENTE" || v.estado === "ASIGNADA")
    .sort((a, b) => a.fecha.localeCompare(b.fecha))[0];
  if (!proxima) return null;

  return (
    <Link href="/visitas" className="tarjeta" style={{ color: "inherit", textDecoration: "none", display: "block" }}>
      <div className="fila">
        <p className="etiqueta-seccion" style={{ margin: 0 }}>
          Próxima visita
        </p>
        <EstadoBadge estado={proxima.estado} />
      </div>
      <h3 style={{ marginTop: 6 }}>{SERVICIOS[proxima.servicio]}</h3>
      <p className="meta" style={{ margin: "4px 0 0" }}>
        {formatearFecha(proxima.fecha)} · {FRANJAS[proxima.franja]}
        {proxima.mecanico && ` · con ${proxima.mecanico.nombre}`}
      </p>
    </Link>
  );
}
