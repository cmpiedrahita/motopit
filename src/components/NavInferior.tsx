"use client";
// Barra de navegación inferior (estilo app) para el domiciliario.
// Solo aparece cuando hay sesión y fuera de las pantallas del mecánico y del registro.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CLAVE_DOMICILIARIO, leerSesion } from "@/lib/sesion";
import { Icono, type NombreIcono } from "./Icono";

const enlaces: { href: string; texto: string; icono: NombreIcono }[] = [
  { href: "/", texto: "Inicio", icono: "casa" },
  { href: "/agendar", texto: "Agendar", icono: "calendario" },
  { href: "/visitas", texto: "Visitas", icono: "lista" },
  { href: "/historial", texto: "Historial", icono: "reloj" },
  { href: "/planes", texto: "Planes", icono: "etiqueta" },
];

const ocultaEn = ["/mecanico", "/registro", "/ingresar"];

export function NavInferior() {
  const ruta = usePathname();
  const [conSesion, setConSesion] = useState(false);

  // Se vuelve a leer en cada cambio de ruta: así aparece justo después de registrarse.
  useEffect(() => setConSesion(!!leerSesion(CLAVE_DOMICILIARIO)), [ruta]);

  if (!conSesion || ocultaEn.some((r) => ruta.startsWith(r))) return null;

  return (
    <nav className="nav-inferior" aria-label="Navegación principal">
      <ul>
        {enlaces.map((e) => (
          <li key={e.href}>
            <Link href={e.href} aria-current={ruta === e.href ? "page" : undefined}>
              <Icono nombre={e.icono} tamano={22} />
              {e.texto}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
