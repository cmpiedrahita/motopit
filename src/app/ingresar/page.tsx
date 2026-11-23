"use client";
// HU-18: el domiciliario vuelve a entrar con su celular y su PIN.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormularioIngreso } from "@/components/FormularioIngreso";
import { Icono } from "@/components/Icono";

export default function Ingresar() {
  const router = useRouter();

  return (
    <>
      <Link href="/" className="enlace fila-inicio" style={{ gap: 4 }}>
        <Icono nombre="atras" tamano={18} /> Volver
      </Link>
      <h1 style={{ marginTop: 16 }}>Ingresa a MotoPit</h1>
      <p className="sub">Escribe el celular con el que registraste tu moto y tu PIN de 4 números.</p>
      <FormularioIngreso rol="domiciliario" onIngreso={() => router.push("/")} />
      <p className="meta" style={{ textAlign: "center", marginTop: 16 }}>
        ¿Primera vez?{" "}
        <Link className="enlace" href="/registro">
          Registra tu moto
        </Link>
      </p>
    </>
  );
}
