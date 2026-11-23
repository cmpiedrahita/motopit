// Inicio para quien aún no se ha registrado: propuesta de valor y llamados a la acción.
import Link from "next/link";
import { EscenaPortada } from "../escenas";
import { Icono, type NombreIcono } from "../Icono";

const beneficios: { icono: NombreIcono; titulo: string; texto: string }[] = [
  {
    icono: "pin",
    titulo: "El mecánico va a donde está tu moto",
    texto: "En la casa, en el parqueadero o en el punto donde esperas pedidos. Sin filas en el taller.",
  },
  {
    icono: "etiqueta",
    titulo: "Plan mensual fijo",
    texto: "Sabes cuánto pagas y qué incluye. Mano de obra y aceite incluidos, sin cobros sorpresa.",
  },
  {
    icono: "gota",
    titulo: "Recordatorios por kilometraje",
    texto: "Te avisamos cuando se acerca el cambio de aceite para que tu moto no te deje tirado.",
  },
  {
    icono: "escudo",
    titulo: "Mecánicos verificados y calificados",
    texto: "Ves la experiencia y la calificación de quien atiende tu moto antes de que llegue.",
  },
];

export function Bienvenida() {
  return (
    <>
      <section className="hero">
        <span className="pildora">
          <Icono nombre="moto" tamano={16} /> Para domiciliarios y mensajeros
        </span>
        <h1>Tu moto al día sin dejar de trabajar</h1>
        <p className="sub">El mecánico va a donde está tu moto. Plan mensual fijo, sin filas en el taller.</p>
        <div className="acciones">
          <Link className="boton" href="/registro">
            Registrar mi moto <Icono nombre="flecha" tamano={18} />
          </Link>
          <Link className="boton secundario" href="/planes">
            Ver planes y precios
          </Link>
        </div>
        <EscenaPortada />
      </section>

      <section className="beneficios" aria-label="Beneficios">
        {beneficios.map((b) => (
          <div key={b.titulo} className="tarjeta beneficio" style={{ margin: 0 }}>
            <span className="beneficio-icono">
              <Icono nombre={b.icono} tamano={22} />
            </span>
            <div>
              <h3>{b.titulo}</h3>
              <p>{b.texto}</p>
            </div>
          </div>
        ))}
      </section>

      <div className="tarjeta fila" style={{ marginTop: 16 }}>
        <div>
          <h3>¿Ya te registraste?</h3>
          <p className="meta" style={{ margin: "2px 0 0" }}>
            Entra con tu número de celular.
          </p>
        </div>
        <Link className="boton secundario pequeno" href="/ingresar">
          Ingresar
        </Link>
      </div>

      <p className="pie">MotoPit · Proyecto de Ingeniería de Software</p>
    </>
  );
}
