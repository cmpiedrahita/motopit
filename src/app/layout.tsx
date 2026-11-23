import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Icono } from "@/components/Icono";
import { NavInferior } from "@/components/NavInferior";
import "./globals.css";

const fuente = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--fuente", display: "swap" });

export const metadata: Metadata = {
  title: "MotoPit · Mantenimiento de motos a domicilio",
  description: "Plan mensual de mantenimiento preventivo para domiciliarios. El mecánico va a donde está tu moto.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#16181d" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={fuente.variable}>
      <body>
        <header className="barra">
          <div className="barra-interna">
            <Link href="/" className="marca" aria-label="MotoPit, ir al inicio">
              <span className="marca-icono">
                <Icono nombre="llave" tamano={18} grosor={2.4} />
              </span>
              <span>
                Moto<b>Pit</b>
              </span>
            </Link>
            <Link href="/mecanico" className="barra-enlace">
              Soy mecánico
            </Link>
          </div>
        </header>
        <main className="contenido">{children}</main>
        <NavInferior />
      </body>
    </html>
  );
}
