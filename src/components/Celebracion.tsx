"use client";
// Pantalla animada que aparece unos segundos después de una acción importante del mecánico:
// - "en-camino": aceptó una visita (HU-04) y sale en su moto.
// - "moto-lista": cerró una visita (HU-06) y la moto quedó a punto.
// Se cierra sola o al tocarla.
import { useEffect } from "react";
import { Escena, Moto } from "./escenas";

export type TipoCelebracion = "en-camino" | "moto-lista";

export function Celebracion({
  tipo,
  titulo,
  detalle,
  onCerrar,
}: {
  tipo: TipoCelebracion;
  titulo: string;
  detalle: string;
  onCerrar: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onCerrar, 3200);
    const conTecla = (e: KeyboardEvent) => e.key === "Escape" && onCerrar();
    window.addEventListener("keydown", conTecla);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", conTecla);
    };
  }, [onCerrar]);

  return (
    <div className="celebracion" role="status" aria-live="polite" onClick={onCerrar}>
      <div className="celebracion-tarjeta">
        {tipo === "en-camino" ? (
          <Escena alto={160} movimiento="rapido">
            <div className="actor" style={{ left: "50%", bottom: 12, transform: "translateX(-50%)" }}>
              <span className="velocidad" style={{ left: -34, bottom: 34 }}>
                <i />
                <i />
                <i />
              </span>
              <Moto variante="mecanico" ancho={120} />
            </div>
          </Escena>
        ) : (
          <Escena alto={160} movimiento="quieto">
            <div className="actor" style={{ left: "50%", bottom: 12, transform: "translateX(-50%)" }}>
              <span className="llave-giro" aria-hidden="true">
                <svg viewBox="0 0 24 24" width={34}>
                  <path
                    d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z"
                    fill="#f7c600"
                  />
                </svg>
              </span>
              <span className="destellos" aria-hidden="true">
                <i />
                <i />
                <i />
                <i />
                <i />
              </span>
              <Moto variante="domiciliario" ancho={116} andando={false} conPiloto={false} clase="brilla" />
            </div>
          </Escena>
        )}
        <div className="celebracion-texto">
          <strong>{titulo}</strong>
          <p>{detalle}</p>
          <span className="celebracion-pista">Toca para continuar</span>
        </div>
      </div>
    </div>
  );
}
