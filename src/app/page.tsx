import Link from "next/link";

// Pantalla de inicio. Cada historia agrega su enlace aquí cuando su pantalla exista.
export default function Inicio() {
  return (
    <section>
      <h1>Tu moto al día sin dejar de trabajar</h1>
      <p className="sub">El mecánico va a donde está tu moto. Plan mensual fijo, sin filas en el taller.</p>

      <div className="acciones">
        <Link className="boton" href="/registro">
          Registrar mi moto
        </Link>
        <Link className="boton secundario" href="/mecanico">
          Soy mecánico
        </Link>
      </div>
    </section>
  );
}
