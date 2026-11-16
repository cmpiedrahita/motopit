import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MotoPit · Mantenimiento de motos a domicilio",
  description: "Plan mensual de mantenimiento preventivo para domiciliarios. El mecánico va a donde está tu moto.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <header className="barra">
          <span className="marca">MotoPit</span>
        </header>
        <main className="contenido">{children}</main>
      </body>
    </html>
  );
}
