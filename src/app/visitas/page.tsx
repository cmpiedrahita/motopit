"use client";
// HU-05: el domiciliario ve sus visitas con estado y, si está asignada, el mecánico.
// HU-13: perfil verificado del mecánico y calificación de 1 a 5 al completar.
// HU-15: el domiciliario cancela una visita que todavía no se ha hecho.
// HU-16: con la visita ASIGNADA puede escribirle al mecánico por WhatsApp.
import Link from "next/link";
import { useState } from "react";
import { EscenaEnCamino } from "@/components/escenas";
import { useDatos, usePerfil } from "@/components/hooks";
import { Estrella, Icono } from "@/components/Icono";
import { PerfilMecanico } from "@/components/PerfilMecanico";
import { TarjetaVisita } from "@/components/TarjetaVisita";
import { Aviso, Esqueleto, Estrellas, ErrorGeneral, Vacio } from "@/components/ui";
import { puedeCalificar } from "@/lib/calificaciones";
import { pedir } from "@/lib/cliente";
import { enlaceWhatsApp, mensajeParaMecanico, puedeContactarMecanico } from "@/lib/contacto";
import { formatearFecha } from "@/lib/formato";
import type { VisitaDetalle } from "@/lib/tipos";

export default function MisVisitas() {
  const { domiciliarioId, cargando: cargandoSesion } = usePerfil();
  const visitas = useDatos<VisitaDetalle[]>(domiciliarioId ? "/api/visitas" : null);

  if (cargandoSesion || (visitas.cargando && !visitas.datos)) return <Esqueleto bloques={[60, 160, 160]} />;
  if (!domiciliarioId) {
    return (
      <Aviso tipo="info" titulo="Primero registra tu moto">
        <Link className="boton pequeno" href="/registro">
          Registrar mi moto
        </Link>
      </Aviso>
    );
  }

  const todas = visitas.datos ?? [];
  const activas = todas
    .filter((v) => v.estado === "PENDIENTE" || v.estado === "ASIGNADA")
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
  const anteriores = todas.filter((v) => v.estado === "COMPLETADA" || v.estado === "CANCELADA");

  return (
    <>
      <div className="fila" style={{ alignItems: "flex-end" }}>
        <div>
          <p className="etiqueta-seccion">Seguimiento</p>
          <h1 style={{ margin: 0 }}>Mis visitas</h1>
        </div>
        <Link className="boton pequeno" href="/agendar">
          <Icono nombre="calendario" tamano={16} /> Nueva
        </Link>
      </div>
      <ErrorGeneral mensaje={visitas.errores?.general} />

      <h2>Próximas</h2>
      {activas.length === 0 ? (
        <Vacio icono="calendario" titulo="No tienes visitas próximas">
          <p className="meta">Agenda una y el mecánico irá a donde está tu moto.</p>
          <Link className="boton" href="/agendar">
            Agendar visita
          </Link>
        </Vacio>
      ) : (
        <div className="pila">
          {activas.map((v) => (
            <TarjetaVisita key={v.id} visita={v}>
              {v.mecanico ? (
                <>
                  <EscenaEnCamino />
                  <p className="en-camino-texto">
                    <Icono nombre="check" tamano={16} grosor={2.5} /> {v.mecanico.nombre.split(" ")[0]} aceptó tu visita
                  </p>
                  <PerfilMecanico mecanico={v.mecanico} titulo="Tu mecánico" />
                  {puedeContactarMecanico(v.estado) && v.mecanico.celular && (
                    <a
                      className="boton secundario"
                      style={{ marginTop: 12 }}
                      href={enlaceWhatsApp(v.mecanico.celular, mensajeParaMecanico(v.moto.placa, formatearFecha(v.fecha)))}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Icono nombre="telefono" tamano={18} /> Escribir por WhatsApp
                    </a>
                  )}
                </>
              ) : (
                <p className="buscando">
                  <span className="radar" aria-hidden="true" />
                  Buscando un mecánico cerca de tu moto…
                </p>
              )}
              <CancelarVisita visitaId={v.id} onCancelada={visitas.recargar} />
            </TarjetaVisita>
          ))}
        </div>
      )}

      {anteriores.length > 0 && (
        <>
          <h2>Anteriores</h2>
          <div className="pila">
            {anteriores.map((v) => (
              <TarjetaVisita key={v.id} visita={v}>
                {v.mecanico && <PerfilMecanico mecanico={v.mecanico} titulo="Te atendió" />}
                {v.estado === "COMPLETADA" && (
                  <Calificacion visita={v} onCalificada={visitas.recargar} />
                )}
              </TarjetaVisita>
            ))}
          </div>
        </>
      )}
    </>
  );
}

function Calificacion({ visita, onCalificada }: { visita: VisitaDetalle; onCalificada: () => void }) {
  const [valor, setValor] = useState(0);
  const [error, setError] = useState<string>();
  const [enviando, setEnviando] = useState(false);

  if (!puedeCalificar(visita)) {
    return (
      <div className="fila" style={{ marginTop: 12 }}>
        <span className="meta">Tu calificación</span>
        <Estrellas valor={visita.calificacion ?? 0} tamano={18} />
      </div>
    );
  }

  async function enviar() {
    setEnviando(true);
    const r = await pedir(`/api/visitas/${visita.id}/calificacion`, {
      metodo: "POST",
      cuerpo: { calificacion: valor },
    });
    setEnviando(false);
    if (!r.ok) return setError(r.errores.calificacion ?? r.errores.general);
    onCalificada();
  }

  return (
    <div style={{ marginTop: 14 }}>
      <strong>¿Cómo te fue con {visita.mecanico?.nombre ?? "el mecánico"}?</strong>
      <div className="selector-estrellas" role="radiogroup" aria-label="Calificación de 1 a 5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={valor === n}
            aria-label={`${n} estrella${n > 1 ? "s" : ""}`}
            className={n <= valor ? "activa" : ""}
            onClick={() => {
              setValor(n);
              setError(undefined);
            }}
          >
            <Estrella tamano={32} />
          </button>
        ))}
      </div>
      {error && <p className="error">{error}</p>}
      <button className="boton pequeno" disabled={!valor || enviando} onClick={enviar}>
        {enviando ? "Enviando…" : "Enviar calificación"}
      </button>
    </div>
  );
}

function CancelarVisita({ visitaId, onCancelada }: { visitaId: string; onCancelada: () => void }) {
  const [error, setError] = useState<string>();
  const [enviando, setEnviando] = useState(false);

  async function cancelar() {
    if (!window.confirm("¿Seguro que quieres cancelar esta visita?")) return;
    setEnviando(true);
    setError(undefined);
    const r = await pedir(`/api/visitas/${visitaId}/cancelar`, { metodo: "PATCH" });
    setEnviando(false);
    if (!r.ok) return setError(r.errores.general);
    onCancelada();
  }

  return (
    <div style={{ marginTop: 12 }}>
      <ErrorGeneral mensaje={error} />
      <button className="boton secundario" disabled={enviando} onClick={cancelar}>
        {enviando ? "Cancelando…" : "Cancelar visita"}
      </button>
    </div>
  );
}
