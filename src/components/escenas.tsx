// Escenas animadas (SVG + CSS, sin librerías). Las animaciones están en src/app/animaciones.css
// y se desactivan solas si el usuario pidió "reducir movimiento" en su sistema.
import type { CSSProperties, ReactNode } from "react";

type Variante = "domiciliario" | "mecanico";

const colores: Record<Variante, { carroceria: string; casco: string; chaqueta: string; pantalon: string }> = {
  domiciliario: { carroceria: "#3b82f6", casco: "#f59e0b", chaqueta: "#334155", pantalon: "#1e293b" },
  mecanico: { carroceria: "#e85d04", casco: "#f8fafc", chaqueta: "#1d4ed8", pantalon: "#1e3a8a" },
};

function Rueda({ cx }: { cx: number }) {
  return (
    <g className="rueda">
      <circle cx={cx} cy={66} r={13} fill="none" stroke="#14161a" strokeWidth={6} />
      <circle cx={cx} cy={66} r={9.5} fill="none" stroke="#3a3f47" strokeWidth={1} />
      <path d={`M${cx} 57v18M${cx - 9} 66h18M${cx - 6.4} 59.6l12.8 12.8M${cx + 6.4} 59.6l-12.8 12.8`} stroke="#9aa1ab" strokeWidth={1.4} />
      <circle cx={cx} cy={66} r={3.5} fill="#cfd4da" />
    </g>
  );
}

/**
 * Moto de lado mirando a la derecha.
 * - `andando`: ruedas girando y el cuerpo rebotando.
 * - `clase`: modificadores de animación (por ejemplo "una-vez" o "llegando").
 */
export function Moto({
  variante = "domiciliario",
  ancho = 120,
  andando = true,
  conPiloto = true,
  clase = "",
  estilo,
}: {
  variante?: Variante;
  ancho?: number;
  andando?: boolean;
  conPiloto?: boolean;
  clase?: string;
  estilo?: CSSProperties;
}) {
  const c = colores[variante];
  return (
    <svg
      className={`moto ${andando ? "andando" : "quieta"} ${clase}`}
      width={ancho}
      viewBox="0 0 128 84"
      style={estilo}
      aria-hidden="true"
    >
      <Rueda cx={30} />
      <Rueda cx={104} />
      <g className="moto-cuerpo">
        {variante === "domiciliario" ? (
          <g>
            {/* Caja de domicilios */}
            <rect x={4} y={12} width={32} height={28} rx={4} fill="#e85d04" />
            <rect x={4} y={21} width={32} height={4} fill="#fff" opacity={0.9} />
            <rect x={10} y={40} width={22} height={4} rx={1} fill="#2a2e35" />
          </g>
        ) : (
          <g>
            {/* Caja de herramientas */}
            <path d="M15 30v-5h12v5" stroke="#1d2026" strokeWidth={2.5} fill="none" />
            <rect x={8} y={29} width={26} height={16} rx={3} fill="#d62828" />
            <rect x={8} y={35} width={26} height={2.5} fill="#1d2026" opacity={0.45} />
          </g>
        )}
        <rect x={16} y={55} width={32} height={5} rx={2.5} fill="#9aa1ab" />
        <path d="M30 66 L58 56" stroke="#3a3f47" strokeWidth={5} strokeLinecap="round" />
        <rect x={50} y={49} width={20} height={13} rx={3} fill="#3a3f47" />
        <path d="M34 46 Q36 40 46 40 L70 38 Q80 30 90 34 L86 50 Q70 56 52 54 L38 54 Q33 52 34 46Z" fill={c.carroceria} />
        <path d="M44 44 L80 40" stroke="#fff" strokeOpacity={0.35} strokeWidth={2} strokeLinecap="round" />
        <path d="M30 40 Q32 35 40 35 L62 35 Q66 35 66 39 L64 41 L32 42Z" fill="#1d2026" />
        <path d="M104 66 L90 28" stroke="#596170" strokeWidth={5} strokeLinecap="round" />
        <path d="M86 26 L97 22" stroke="#1d2026" strokeWidth={4} strokeLinecap="round" />
        <path d="M90 53 Q104 45 117 55" stroke={c.carroceria} strokeWidth={4} fill="none" strokeLinecap="round" />
        <circle className="farola" cx={97} cy={36} r={4} fill="#ffd166" />
        {conPiloto && (
          <g>
            <path d="M54 40 L71 45 L72 58" stroke={c.pantalon} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M70 59 h8" stroke="#1d2026" strokeWidth={5} strokeLinecap="round" />
            <path d="M52 38 L62 17" stroke={c.chaqueta} strokeWidth={12} strokeLinecap="round" />
            <path d="M62 19 L76 27 L88 25" stroke={c.chaqueta} strokeWidth={5.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <circle cx={65} cy={9} r={8.5} fill={c.casco} />
            <path d="M66 5.5 h7 q2.5 0 2.5 3 v1.5 h-9.5z" fill="#1d2026" />
            {variante === "mecanico" && <path d="M57 6 q8 -7 16 0" stroke="#e85d04" strokeWidth={3} fill="none" strokeLinecap="round" />}
          </g>
        )}
      </g>
    </svg>
  );
}

// Edificios de la ciudad de fondo: [x, ancho, alto] dentro de un tramo de 400 px.
const EDIFICIOS = [
  [0, 34, 38], [38, 22, 54], [62, 40, 30], [104, 26, 62], [132, 36, 42], [170, 20, 28],
  [192, 44, 50], [238, 28, 36], [268, 34, 58], [304, 24, 32], [330, 40, 46], [372, 28, 26],
] as const;

function Ciudad() {
  const piezas: ReactNode[] = [];
  for (const desfase of [0, 400]) {
    for (const [x, w, h] of EDIFICIOS) {
      const bx = x + desfase;
      piezas.push(<rect key={`e${bx}`} className="edificio" x={bx} y={70 - h} width={w} height={h} rx={2} />);
      for (let y = 70 - h + 6; y < 62; y += 9) {
        for (let wx = bx + 5; wx < bx + w - 5; wx += 8) {
          piezas.push(<rect key={`v${wx}-${y}`} className="ventana" x={wx} y={y} width={3} height={4} rx={0.5} />);
        }
      }
    }
  }
  return (
    <svg className="escena-ciudad" viewBox="0 0 800 70" preserveAspectRatio="none" aria-hidden="true">
      {piezas}
    </svg>
  );
}

/** Calle con ciudad de fondo. `movimiento` decide si el fondo se desplaza (la "cámara" va con la moto). */
export function Escena({
  children,
  alto = 140,
  tono = "oscuro",
  movimiento = "normal",
  clase = "",
}: {
  children: ReactNode;
  alto?: number;
  tono?: "oscuro" | "claro";
  movimiento?: "normal" | "rapido" | "quieto";
  clase?: string;
}) {
  return (
    <div className={`escena escena-${tono} escena-${movimiento} ${clase}`} style={{ height: alto }} aria-hidden="true">
      {tono === "claro" && <span className="escena-sol" />}
      <Ciudad />
      <div className="escena-carretera" />
      {children}
    </div>
  );
}

/** Líneas de velocidad detrás de una moto en marcha. */
function Velocidad({ estilo }: { estilo?: CSSProperties }) {
  return (
    <span className="velocidad" style={estilo}>
      <i />
      <i />
      <i />
    </span>
  );
}

/** Portada: el domiciliario va trabajando y el mecánico lo sigue. */
export function EscenaPortada() {
  return (
    <Escena alto={150} clase="escena-portada">
      <div className="actor" style={{ left: "6%", bottom: 12 }}>
        <div className="persecucion">
          <Velocidad estilo={{ left: -30, bottom: 30 }} />
          <Moto variante="mecanico" ancho={92} />
        </div>
      </div>
      <div className="actor" style={{ left: "52%", bottom: 12 }}>
        <Velocidad estilo={{ left: -34, bottom: 34 }} />
        <Moto variante="domiciliario" ancho={112} />
      </div>
    </Escena>
  );
}

/** Después de agendar: el mecánico llega hasta donde está la moto del domiciliario. */
export function EscenaLlegada() {
  return (
    <Escena alto={170} tono="claro" movimiento="quieto" clase="escena-llegada">
      <div className="actor" style={{ right: "6%", bottom: 12 }}>
        <span className="pin-destino">
          <svg viewBox="0 0 24 24" width={30} aria-hidden="true">
            <path d="M12 22s-7-6.2-7-12a7 7 0 1 1 14 0c0 5.8-7 12-7 12Z" fill="#e85d04" />
            <circle cx={12} cy={10} r={3} fill="#fff" />
          </svg>
        </span>
        <Moto variante="domiciliario" ancho={96} andando={false} conPiloto={false} />
      </div>
      <div className="actor llegando" style={{ left: "calc(94% - 96px - 112px)", bottom: 12 }}>
        <span className="polvo">
          <i />
          <i />
          <i />
        </span>
        <Moto variante="mecanico" ancho={104} clase="frena" />
        <span className="globo">¡Allá llego!</span>
      </div>
    </Escena>
  );
}

/** Tarjeta de visita asignada: el mecánico va en camino. */
export function EscenaEnCamino() {
  return (
    <Escena alto={92} tono="claro" movimiento="rapido" clase="escena-mini">
      <div className="actor" style={{ left: "50%", bottom: 8, transform: "translateX(-50%)" }}>
        <Velocidad estilo={{ left: -28, bottom: 24 }} />
        <Moto variante="mecanico" ancho={78} />
      </div>
    </Escena>
  );
}

/** Pantalla de carga: una moto pequeña cruzando. */
export function MotoCargando() {
  return (
    <div className="cargando-ruta" aria-hidden="true">
      <div className="cargando-moto">
        <Moto variante="domiciliario" ancho={54} />
      </div>
    </div>
  );
}

/**
 * HU-07 en forma de ruta: la moto está en el km actual y la meta es el próximo cambio de aceite.
 * Al montar, la moto "maneja" desde el último cambio hasta su posición.
 */
export function RutaAceite({ progreso, estado }: { progreso: number; estado: "ok" | "cerca" | "vencido" }) {
  return (
    <div className={`ruta-aceite ruta-${estado}`} style={{ "--p": progreso } as CSSProperties}>
      <div className="ruta-recorrido" />
      <div className="ruta-moto">
        <Moto variante="domiciliario" ancho={52} clase="una-vez" />
      </div>
      <span className="ruta-meta" title="Próximo cambio de aceite">
        <svg viewBox="0 0 24 24" width={22} aria-hidden="true">
          <path d="M5 21V4" stroke="#1d2026" strokeWidth={2} strokeLinecap="round" />
          <path d="M5 4h12l-3 4 3 4H5z" fill={estado === "ok" ? "#22c55e" : estado === "cerca" ? "#f59e0b" : "#b00020"} />
        </svg>
      </span>
    </div>
  );
}

/**
 * Carretera de pasos para agendar: cada parada es una opción del formulario
 * y la moto avanza hasta la última parada completada.
 */
export function CarreteraPasos({ pasos, completados }: { pasos: { nombre: string; listo: boolean }[]; completados: number }) {
  const total = pasos.length;
  return (
    <div className="carretera-pasos" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={completados} aria-label="Avance del formulario">
      <div className="cp-via">
        <div className="cp-avance" style={{ width: `${(completados / total) * 100}%` }} />
        <div className="cp-moto" style={{ left: `calc(${(completados / total) * 100}% - ${(completados / total) * 56}px)` }}>
          <Moto variante="mecanico" ancho={56} />
        </div>
      </div>
      <ol className="cp-paradas">
        {pasos.map((p, i) => (
          <li key={p.nombre} className={p.listo ? "lista" : ""}>
            <span className="cp-punto">{p.listo ? "✓" : i + 1}</span>
            {p.nombre}
          </li>
        ))}
      </ol>
    </div>
  );
}
