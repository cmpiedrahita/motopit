"use client";
// Volver a entrar con el celular (el MVP no tiene contraseña: el id queda en localStorage).
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useSesion } from "@/components/hooks";
import { Icono } from "@/components/Icono";
import { Campo } from "@/components/ui";
import { pedir } from "@/lib/cliente";
import { CLAVE_DOMICILIARIO } from "@/lib/sesion";

export default function Ingresar() {
  const router = useRouter();
  const sesion = useSesion(CLAVE_DOMICILIARIO);
  const [celular, setCelular] = useState("");
  const [error, setError] = useState<string>();
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    const r = await pedir<{ id: string }>(`/api/domiciliarios?celular=${encodeURIComponent(celular)}`);
    setEnviando(false);
    if (!r.ok) return setError(r.errores.celular ?? r.errores.general);
    sesion.guardar(r.datos.id);
    router.push("/");
  }

  return (
    <>
      <Link href="/" className="enlace fila-inicio" style={{ gap: 4 }}>
        <Icono nombre="atras" tamano={18} /> Volver
      </Link>
      <h1 style={{ marginTop: 16 }}>Ingresa a MotoPit</h1>
      <p className="sub">Escribe el celular con el que registraste tu moto.</p>
      <form className="formulario" onSubmit={enviar} noValidate>
        <Campo id="celular" etiqueta="Celular" error={error}>
          <input
            id="celular"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="300 123 4567"
            value={celular}
            onChange={(e) => {
              setCelular(e.target.value);
              setError(undefined);
            }}
            aria-invalid={!!error}
          />
        </Campo>
        <button className="boton" disabled={enviando}>
          {enviando ? "Buscando…" : "Ingresar"}
        </button>
        <p className="meta" style={{ textAlign: "center", margin: 0 }}>
          ¿Primera vez?{" "}
          <Link className="enlace" href="/registro">
            Registra tu moto
          </Link>
        </p>
      </form>
    </>
  );
}
