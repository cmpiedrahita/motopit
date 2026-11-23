"use client";
// Pantalla de inicio: bienvenida si no hay sesión, panel del domiciliario si la hay.
import { usePerfil } from "@/components/hooks";
import { Bienvenida } from "@/components/inicio/Bienvenida";
import { Panel } from "@/components/inicio/Panel";
import { Esqueleto, ErrorGeneral } from "@/components/ui";

export default function Inicio() {
  const { perfil, cargando, errores, recargar, salir } = usePerfil();

  if (cargando) return <Esqueleto bloques={[60, 170, 110, 90]} />;
  if (perfil) return <Panel perfil={perfil} onCambio={recargar} onSalir={salir} />;
  if (errores?.general && errores.general !== "El domiciliario no existe") return <ErrorGeneral mensaje={errores.general} />;
  return <Bienvenida />;
}
