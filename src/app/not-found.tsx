import Link from "next/link";
import { Vacio } from "@/components/ui";

export default function NoEncontrada() {
  return (
    <Vacio icono="moto" titulo="Esta página no existe">
      <p className="meta">Puede que el enlace esté mal escrito o que la página se haya movido.</p>
      <Link className="boton" href="/">
        Volver al inicio
      </Link>
    </Vacio>
  );
}
