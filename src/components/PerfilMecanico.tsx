// HU-13: perfil del mecánico — nombre, experiencia, sello de verificado y calificación promedio.
import type { MecanicoPerfil } from "@/lib/tipos";
import { Icono } from "./Icono";
import { Estrellas } from "./ui";

function iniciales(nombre: string) {
  return nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function PerfilMecanico({ mecanico, titulo }: { mecanico: MecanicoPerfil; titulo?: string }) {
  return (
    <div className="perfil-mecanico">
      <span className="avatar" aria-hidden="true">
        {iniciales(mecanico.nombre)}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        {titulo && <p className="etiqueta-seccion">{titulo}</p>}
        <div className="fila-inicio" style={{ flexWrap: "wrap", gap: 8 }}>
          <strong>{mecanico.nombre}</strong>
          {mecanico.verificado && (
            <span className="verificado">
              <Icono nombre="escudo" tamano={15} /> Verificado
            </span>
          )}
        </div>
        <div className="meta" style={{ marginTop: 2 }}>
          {mecanico.aniosExperiencia} años de experiencia
        </div>
        <div className="fila-inicio meta" style={{ gap: 8, marginTop: 2 }}>
          {mecanico.promedio !== null ? (
            <span className="fila-inicio" style={{ gap: 4 }}>
              <Estrellas valor={mecanico.promedio} tamano={14} />
              <strong style={{ color: "var(--texto)" }}>{mecanico.promedio.toFixed(1)}</strong>
              <span>({mecanico.totalCalificaciones})</span>
            </span>
          ) : (
            <span>Sin calificaciones aún</span>
          )}
        </div>
      </div>
    </div>
  );
}
