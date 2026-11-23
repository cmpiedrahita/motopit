"use client";
// HU-04: el mecánico ve y acepta visitas pendientes.
// HU-06: el mecánico cierra sus visitas registrando el trabajo y el km.
// HU-18: el mecánico entra con su celular y su PIN; la API solo le deja actuar a su nombre.
import { useCallback, useState, type FormEvent } from "react";
import { Celebracion, type TipoCelebracion } from "@/components/Celebracion";
import { Moto } from "@/components/escenas";
import { FormularioIngreso } from "@/components/FormularioIngreso";
import { useDatos } from "@/components/hooks";
import { Icono } from "@/components/Icono";
import { PerfilMecanico } from "@/components/PerfilMecanico";
import { useSesion } from "@/components/SesionProvider";
import { TarjetaVisita } from "@/components/TarjetaVisita";
import { Aviso, Campo, Dato, ErrorGeneral, Esqueleto, Placa, Vacio } from "@/components/ui";
import { pedir } from "@/lib/cliente";
import { formatearKm } from "@/lib/formato";
import type { MecanicoPerfil, VisitaDetalle } from "@/lib/tipos";
import type { Errores } from "@/lib/validacion";

type VisitasMecanico = { pendientes: VisitaDetalle[]; asignadas: VisitaDetalle[] };

export default function PaginaMecanico() {
  const { mecanicoId, salir } = useSesion();
  const mecanicos = useDatos<MecanicoPerfil[]>(mecanicoId ? "/api/mecanicos" : null);
  const yo = mecanicos.datos?.find((m) => m.id === mecanicoId);

  if (mecanicoId === undefined || (mecanicoId && !mecanicos.datos && !mecanicos.errores)) {
    return <Esqueleto bloques={[60, 90, 90]} />;
  }
  if (!mecanicoId || !yo) return <IngresoMecanico error={mecanicos.errores?.general} />;
  return <Tablero mecanico={yo} onSalir={() => salir("mecanico")} />;
}

function IngresoMecanico({ error }: { error?: string }) {
  return (
    <>
      <div style={{ display: "grid", placeItems: "center", margin: "8px 0 4px" }}>
        <Moto variante="mecanico" ancho={110} />
      </div>
      <p className="etiqueta-seccion">Mecánicos aliados</p>
      <h1>Ingresa a tu panel</h1>
      <p className="sub">Con tu celular y tu PIN ves las visitas pendientes y las que tienes asignadas.</p>
      <ErrorGeneral mensaje={error} />
      <FormularioIngreso rol="mecanico" />
    </>
  );
}

function Tablero({ mecanico, onSalir }: { mecanico: MecanicoPerfil; onSalir: () => void }) {
  const visitas = useDatos<VisitasMecanico>(`/api/mecanicos/${mecanico.id}/visitas`);
  const [pestana, setPestana] = useState<"pendientes" | "asignadas">("pendientes");
  const [mensaje, setMensaje] = useState<{ tipo: "exito" | "peligro"; texto: string }>();
  const [celebracion, setCelebracion] = useState<{ tipo: TipoCelebracion; titulo: string; detalle: string }>();
  const cerrarCelebracion = useCallback(() => setCelebracion(undefined), []);

  const pendientes = visitas.datos?.pendientes ?? [];
  const asignadas = visitas.datos?.asignadas ?? [];

  async function aceptar(visita: VisitaDetalle) {
    const r = await pedir(`/api/visitas/${visita.id}/aceptar`, { metodo: "PATCH" });
    if (r.ok) {
      setCelebracion({
        tipo: "en-camino",
        titulo: "¡Vas en camino!",
        detalle: `${visita.domiciliario.nombre} te espera con la moto ${visita.moto.placa}.`,
      });
      setMensaje({ tipo: "exito", texto: `Aceptaste la visita de ${visita.domiciliario.nombre}. Quedó en "Mis visitas".` });
    } else {
      setMensaje({ tipo: "peligro", texto: r.errores.general ?? "No se pudo aceptar la visita" });
    }
    visitas.recargar();
  }

  function alCerrar(visita: VisitaDetalle) {
    setCelebracion({ tipo: "moto-lista", titulo: "¡Moto lista!", detalle: `El trabajo quedó en el historial de ${visita.moto.placa}.` });
    setMensaje({ tipo: "exito", texto: `Cerraste la visita de ${visita.moto.placa}. Quedó en su historial.` });
    visitas.recargar();
  }

  return (
    <>
      {celebracion && <Celebracion {...celebracion} onCerrar={cerrarCelebracion} />}
      <div className="fila">
        <p className="etiqueta-seccion" style={{ margin: 0 }}>
          Panel del mecánico
        </p>
        <button className="enlace fila-inicio" style={{ gap: 4, fontSize: "0.88rem" }} onClick={onSalir}>
          <Icono nombre="salir" tamano={16} /> Salir
        </button>
      </div>
      <div className="sin-margen" style={{ marginTop: 10 }}>
        <PerfilMecanico mecanico={mecanico} />
      </div>

      <div className="pestanas" role="tablist">
        <button className="pestana" role="tab" aria-selected={pestana === "pendientes"} onClick={() => setPestana("pendientes")}>
          Pendientes{pendientes.length > 0 && <span className="contador">{pendientes.length}</span>}
        </button>
        <button className="pestana" role="tab" aria-selected={pestana === "asignadas"} onClick={() => setPestana("asignadas")}>
          Mis visitas{asignadas.length > 0 && <span className="contador">{asignadas.length}</span>}
        </button>
      </div>

      {mensaje && (
        <div style={{ marginBottom: 12 }}>
          <Aviso tipo={mensaje.tipo} titulo={mensaje.texto} />
        </div>
      )}
      <ErrorGeneral mensaje={visitas.errores?.general} />
      {visitas.cargando && !visitas.datos && <Esqueleto bloques={[180, 180]} />}

      {visitas.datos && pestana === "pendientes" && (
        <div className="pila">
          {pendientes.length === 0 && (
            <Vacio icono="lista" titulo="No hay visitas pendientes">
              <p className="meta">Cuando un domiciliario agende una visita aparecerá aquí.</p>
            </Vacio>
          )}
          {pendientes.map((v) => (
            <TarjetaVisita key={v.id} visita={v}>
              <DatosMoto visita={v} />
              <BotonAsync className="boton" style={{ marginTop: 14 }} onClick={() => aceptar(v)} textoCargando="Aceptando…">
                Aceptar visita
              </BotonAsync>
            </TarjetaVisita>
          ))}
        </div>
      )}

      {visitas.datos && pestana === "asignadas" && (
        <div className="pila">
          {asignadas.length === 0 && (
            <Vacio icono="llave" titulo="No tienes visitas asignadas">
              <p className="meta">Acepta una visita pendiente para verla aquí.</p>
            </Vacio>
          )}
          {asignadas.map((v) => (
            <TarjetaVisita key={v.id} visita={v}>
              <DatosMoto visita={v} conTelefono />
              <CerrarVisita visita={v} onCerrada={() => alCerrar(v)} />
            </TarjetaVisita>
          ))}
        </div>
      )}
    </>
  );
}

function DatosMoto({ visita, conTelefono = false }: { visita: VisitaDetalle; conTelefono?: boolean }) {
  return (
    <div className="fila" style={{ marginTop: 12, padding: 12, borderRadius: 10, background: "var(--superficie-2)" }}>
      <div>
        <strong>{visita.domiciliario.nombre}</strong>
        <p className="meta" style={{ margin: "2px 0 0" }}>
          {visita.moto.marca} · {formatearKm(visita.moto.kmActual)}
        </p>
        {conTelefono && (
          <a href={`tel:${visita.domiciliario.celular}`} className="enlace fila-inicio" style={{ gap: 4, marginTop: 6, fontSize: "0.9rem" }}>
            <Icono nombre="telefono" tamano={15} /> {visita.domiciliario.celular}
          </a>
        )}
      </div>
      <Placa placa={visita.moto.placa} pequena />
    </div>
  );
}

function BotonAsync({
  onClick,
  textoCargando,
  children,
  ...props
}: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> & { onClick: () => Promise<void>; textoCargando: string }) {
  const [cargando, setCargando] = useState(false);
  return (
    <button
      {...props}
      disabled={cargando}
      onClick={async () => {
        setCargando(true);
        await onClick();
        setCargando(false);
      }}
    >
      {cargando ? textoCargando : children}
    </button>
  );
}

// HU-06: formulario para cerrar la visita.
function CerrarVisita({ visita, onCerrada }: { visita: VisitaDetalle; onCerrada: () => void }) {
  const [abierto, setAbierto] = useState(false);
  const [form, setForm] = useState({ trabajoRealizado: "", km: "" });
  const [errores, setErrores] = useState<Errores>({});
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    const r = await pedir(`/api/visitas/${visita.id}/cerrar`, { metodo: "PATCH", cuerpo: form });
    setEnviando(false);
    if (!r.ok) return setErrores(r.errores);
    onCerrada();
  }

  if (!abierto) {
    return (
      <button className="boton oscuro" style={{ marginTop: 14 }} onClick={() => setAbierto(true)}>
        <Icono nombre="check" tamano={18} /> Cerrar visita
      </button>
    );
  }

  return (
    <form className="formulario" onSubmit={enviar} noValidate style={{ marginTop: 16 }}>
      <hr className="separador" style={{ margin: 0 }} />
      <ErrorGeneral mensaje={errores.general} />
      <Campo id={`trabajo-${visita.id}`} etiqueta="Trabajo realizado" error={errores.trabajoRealizado}>
        <textarea
          id={`trabajo-${visita.id}`}
          value={form.trabajoRealizado}
          onChange={(e) => setForm((f) => ({ ...f, trabajoRealizado: e.target.value }))}
          placeholder="Ej. Cambio de aceite 20W-50, ajuste de cadena y revisión de frenos."
          aria-invalid={!!errores.trabajoRealizado}
        />
      </Campo>
      <Campo
        id={`km-${visita.id}`}
        etiqueta="Kilometraje de la moto"
        error={errores.km}
        ayuda={`Km registrado: ${formatearKm(visita.moto.kmActual)}. No puede ser menor.`}
      >
        <input
          id={`km-${visita.id}`}
          type="number"
          inputMode="numeric"
          min={visita.moto.kmActual}
          value={form.km}
          onChange={(e) => setForm((f) => ({ ...f, km: e.target.value }))}
          placeholder={String(visita.moto.kmActual)}
          aria-invalid={!!errores.km}
        />
      </Campo>
      <Dato icono="info">La visita quedará como completada y se actualizará el km de la moto.</Dato>
      <div className="fila">
        <button type="button" className="boton secundario" onClick={() => setAbierto(false)}>
          Cancelar
        </button>
        <button className="boton" disabled={enviando}>
          {enviando ? "Guardando…" : "Completar visita"}
        </button>
      </div>
    </form>
  );
}
