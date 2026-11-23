"use client";
// HU-02: elegir plan mensual. Se ve qué incluye y qué NO incluye; solo un plan activo a la vez.
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useDatos, usePerfil } from "@/components/hooks";
import { Icono } from "@/components/Icono";
import { Aviso, ErrorGeneral, Esqueleto } from "@/components/ui";
import { pedir } from "@/lib/cliente";
import { formatearPesos } from "@/lib/formato";
import type { Plan } from "@/lib/tipos";

export default function PaginaPlanes() {
  return (
    <Suspense fallback={<Esqueleto />}>
      <Planes />
    </Suspense>
  );
}

function Planes() {
  const router = useRouter();
  const bienvenida = useSearchParams().get("bienvenida") === "1";
  const planes = useDatos<Plan[]>("/api/planes");
  const { perfil, domiciliarioId, recargar } = usePerfil();
  const [eligiendo, setEligiendo] = useState<string>();
  const [error, setError] = useState<string>();
  const [elegido, setElegido] = useState<string>();

  async function elegir(plan: Plan) {
    if (!domiciliarioId) return router.push("/registro");
    setEligiendo(plan.id);
    setError(undefined);
    const r = await pedir("/api/suscripciones", { metodo: "POST", cuerpo: { domiciliarioId, planId: plan.id } });
    setEligiendo(undefined);
    if (!r.ok) return setError(r.errores.general ?? r.errores.planId);
    setElegido(plan.nombre);
    recargar();
  }

  return (
    <>
      <p className="etiqueta-seccion">Planes mensuales</p>
      <h1>{bienvenida ? "¡Listo! Ahora elige tu plan" : "Elige tu plan"}</h1>
      <p className="sub">Precio fijo cada mes. Puedes cambiar de plan cuando quieras: solo uno queda activo.</p>

      <div className="pila">
        {elegido && (
          <Aviso tipo="exito" titulo={`Tu ${elegido} quedó activo`}>
            <p>Ya puedes agendar tu primera visita a domicilio.</p>
            <Link className="boton pequeno" href="/agendar">
              <Icono nombre="calendario" tamano={16} /> Agendar visita
            </Link>
          </Aviso>
        )}
        <ErrorGeneral mensaje={error ?? planes.errores?.general} />

        {planes.cargando && !planes.datos && <Esqueleto bloques={[360, 360]} />}

        {planes.datos?.map((plan, i) => {
          const activo = perfil?.plan?.id === plan.id;
          const destacado = i === planes.datos!.length - 1;
          return (
            <article key={plan.id} className={`tarjeta plan${destacado ? " destacado" : ""}`} style={{ marginTop: destacado ? 14 : 0 }}>
              {destacado && <span className="plan-cinta">Más completo</span>}
              <div className="fila">
                <h3 style={{ fontSize: "1.15rem" }}>{plan.nombre}</h3>
                {activo && <span className="badge badge-COMPLETADA">Tu plan actual</span>}
              </div>
              <p className="precio">
                {formatearPesos(plan.precioMensual)} <small>/ mes</small>
              </p>

              <p className="etiqueta-seccion" style={{ marginTop: 14 }}>
                Incluye
              </p>
              <ul className="lista si">
                {plan.incluye.map((item) => (
                  <li key={item}>
                    <Icono nombre="check" tamano={18} grosor={2.5} /> {item}
                  </li>
                ))}
              </ul>

              <p className="etiqueta-seccion" style={{ marginTop: 16 }}>
                No incluye
              </p>
              <ul className="lista no">
                {plan.noIncluye.map((item) => (
                  <li key={item}>
                    <Icono nombre="x" tamano={18} grosor={2.5} /> {item}
                  </li>
                ))}
              </ul>

              <button
                className={`boton${destacado ? "" : " oscuro"}`}
                style={{ marginTop: 18 }}
                disabled={activo || !!eligiendo}
                onClick={() => elegir(plan)}
              >
                {activo ? "Plan activo" : eligiendo === plan.id ? "Activando…" : domiciliarioId ? "Elegir este plan" : "Registrarme y elegir"}
              </button>
            </article>
          );
        })}

        {planes.datos?.length === 0 && (
          <Aviso tipo="info" titulo="Aún no hay planes cargados">
            <p>Ejecuta <code>npm run db:seed</code> para cargar los planes de demo.</p>
          </Aviso>
        )}
      </div>
    </>
  );
}
