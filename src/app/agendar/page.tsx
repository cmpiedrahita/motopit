"use client";
// HU-03: agendar una visita donde está la moto. Requiere plan activo y no acepta fechas pasadas.
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { usePerfil } from "@/components/hooks";
import { Icono, type NombreIcono } from "@/components/Icono";
import { Aviso, Campo, Dato, ErrorGeneral, Esqueleto } from "@/components/ui";
import { MENSAJE_SIN_PLAN } from "@/lib/agenda";
import { pedir } from "@/lib/cliente";
import { FRANJAS, SERVICIOS, formatearFecha, hoyEnBogota, type Franja, type Servicio } from "@/lib/formato";
import type { Errores } from "@/lib/validacion";

const iconosFranja: Record<Franja, NombreIcono> = { MANANA: "sol", TARDE: "atardecer", NOCHE: "luna" };
const iconosServicio: Record<Servicio, NombreIcono> = {
  CAMBIO_ACEITE: "gota",
  FRENOS: "freno",
  CADENA: "cadena",
  REVISION_GENERAL: "llave",
};

export default function PaginaAgendar() {
  return (
    <Suspense fallback={<Esqueleto />}>
      <Agendar />
    </Suspense>
  );
}

function Agendar() {
  const servicioInicial = useSearchParams().get("servicio");
  const { perfil, cargando, domiciliarioId } = usePerfil();
  const [form, setForm] = useState({
    direccion: "",
    fecha: "",
    franja: "",
    servicio: servicioInicial && servicioInicial in SERVICIOS ? servicioInicial : "",
  });
  const [errores, setErrores] = useState<Errores>({});
  const [enviando, setEnviando] = useState(false);
  const [agendada, setAgendada] = useState(false);

  if (cargando) return <Esqueleto bloques={[60, 300]} />;
  if (!domiciliarioId || !perfil) {
    return (
      <Aviso tipo="info" titulo="Primero registra tu moto">
        <p>Para agendar una visita necesitamos saber qué moto vamos a atender.</p>
        <Link className="boton pequeno" href="/registro">
          Registrar mi moto
        </Link>
      </Aviso>
    );
  }

  function cambiar(campo: keyof typeof form, valor: string) {
    setForm((f) => ({ ...f, [campo]: valor }));
    setErrores((actuales) => {
      const resto = { ...actuales };
      delete resto[campo];
      return resto;
    });
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    const r = await pedir("/api/visitas", { metodo: "POST", cuerpo: { ...form, domiciliarioId } });
    setEnviando(false);
    if (!r.ok) return setErrores(r.errores);
    setAgendada(true);
    window.scrollTo({ top: 0 });
  }

  if (agendada) {
    return (
      <div className="exito-grande">
        <span className="vacio-icono">
          <Icono nombre="check" tamano={36} grosor={2.5} />
        </span>
        <h1>¡Visita agendada!</h1>
        <p className="sub">Un mecánico la va a aceptar pronto. Te mostramos su perfil apenas lo haga.</p>
        <div className="tarjeta" style={{ textAlign: "left" }}>
          <h3>{SERVICIOS[form.servicio as Servicio]}</h3>
          <Dato icono="calendario">
            {formatearFecha(`${form.fecha}T12:00:00Z`)} · {FRANJAS[form.franja as Franja]}
          </Dato>
          <Dato icono="pin">{form.direccion}</Dato>
        </div>
        <div className="acciones" style={{ marginTop: 20 }}>
          <Link className="boton" href="/visitas">
            Ver mis visitas
          </Link>
          <Link className="boton secundario" href="/">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const sinPlan = !perfil.plan;

  return (
    <>
      <p className="etiqueta-seccion">Nueva visita</p>
      <h1>Agenda tu visita</h1>
      <p className="sub">Dinos dónde está la moto y cuándo te sirve. El mecánico va hasta allá.</p>

      {(sinPlan || errores.plan) && (
        <div style={{ marginBottom: 20 }}>
          <Aviso tipo="alerta" titulo="No puedes agendar todavía" icono="etiqueta">
            <p>{errores.plan ?? MENSAJE_SIN_PLAN}</p>
            <Link className="boton pequeno" href="/planes">
              Ver planes
            </Link>
          </Aviso>
        </div>
      )}

      <form className="formulario" onSubmit={enviar} noValidate>
        <ErrorGeneral mensaje={errores.general} />

        <Campo id="direccion" etiqueta="¿Dónde está la moto?" error={errores.direccion} ayuda="Calle, número y barrio. Agrega una referencia si ayuda.">
          <input
            id="direccion"
            value={form.direccion}
            onChange={(e) => cambiar("direccion", e.target.value)}
            placeholder="Ej. Calle 45 # 12-30, Chapinero"
            autoComplete="street-address"
            aria-invalid={!!errores.direccion}
            disabled={sinPlan}
          />
        </Campo>

        <Campo id="fecha" etiqueta="Fecha" error={errores.fecha}>
          <input
            id="fecha"
            type="date"
            min={hoyEnBogota()}
            value={form.fecha}
            onChange={(e) => cambiar("fecha", e.target.value)}
            aria-invalid={!!errores.fecha}
            disabled={sinPlan}
          />
        </Campo>

        <fieldset style={{ border: 0, padding: 0, margin: 0 }} disabled={sinPlan}>
          <legend style={{ fontWeight: 700, fontSize: "0.92rem", marginBottom: 6 }}>Franja horaria</legend>
          <div className="opciones" style={{ gridTemplateColumns: "1fr" }}>
            {(Object.keys(FRANJAS) as Franja[]).map((f) => (
              <label key={f} className="opcion" style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <input type="radio" name="franja" value={f} checked={form.franja === f} onChange={() => cambiar("franja", f)} />
                <Icono nombre={iconosFranja[f]} />
                {FRANJAS[f]}
              </label>
            ))}
          </div>
          {errores.franja && <p className="error">{errores.franja}</p>}
        </fieldset>

        <fieldset style={{ border: 0, padding: 0, margin: 0 }} disabled={sinPlan}>
          <legend style={{ fontWeight: 700, fontSize: "0.92rem", marginBottom: 6 }}>Servicio</legend>
          <div className="opciones">
            {(Object.keys(SERVICIOS) as Servicio[]).map((s) => (
              <label key={s} className="opcion">
                <input type="radio" name="servicio" value={s} checked={form.servicio === s} onChange={() => cambiar("servicio", s)} />
                <Icono nombre={iconosServicio[s]} tamano={22} />
                {SERVICIOS[s]}
              </label>
            ))}
          </div>
          {errores.servicio && <p className="error">{errores.servicio}</p>}
        </fieldset>

        <button className="boton" disabled={enviando || sinPlan} style={{ marginTop: 8 }}>
          {enviando ? "Agendando…" : "Agendar visita"}
        </button>
      </form>
    </>
  );
}
