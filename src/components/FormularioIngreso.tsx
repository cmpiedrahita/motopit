"use client";
// HU-18: formulario de ingreso con celular y PIN, para domiciliarios y mecánicos.
import { useState, type FormEvent } from "react";
import type { Rol } from "@/lib/auth";
import { pedir } from "@/lib/cliente";
import type { Errores } from "@/lib/validacion";
import { useSesion } from "./SesionProvider";
import { Campo, ErrorGeneral } from "./ui";

export function FormularioIngreso({ rol, onIngreso }: { rol: Rol; onIngreso?: () => void }) {
  const { refrescar } = useSesion();
  const [form, setForm] = useState({ celular: "", pin: "" });
  const [errores, setErrores] = useState<Errores>({});
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    const r = await pedir("/api/sesion", { metodo: "POST", cuerpo: { rol, ...form } });
    setEnviando(false);
    if (!r.ok) return setErrores(r.errores);
    await refrescar();
    onIngreso?.();
  }

  const cambiar = (campo: "celular" | "pin", valor: string) => {
    setForm((f) => ({ ...f, [campo]: valor }));
    setErrores({});
  };

  return (
    <form className="formulario" onSubmit={enviar} noValidate>
      <ErrorGeneral mensaje={errores.general} />
      <Campo id="celular" etiqueta="Celular" error={errores.celular}>
        <input
          id="celular"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="300 123 4567"
          value={form.celular}
          onChange={(e) => cambiar("celular", e.target.value)}
          aria-invalid={!!errores.celular}
        />
      </Campo>
      <Campo id="pin" etiqueta="PIN" error={errores.pin} ayuda={rol === "domiciliario" ? "Los 4 números que creaste al registrarte." : "Los 4 números que te asignó MotoPit."}>
        <input
          id="pin"
          type="password"
          inputMode="numeric"
          autoComplete="current-password"
          maxLength={4}
          placeholder="••••"
          value={form.pin}
          onChange={(e) => cambiar("pin", e.target.value.replace(/\D/g, ""))}
          aria-invalid={!!errores.pin}
          style={{ letterSpacing: "0.5em", fontWeight: 700 }}
        />
      </Campo>
      <button className="boton" disabled={enviando}>
        {enviando ? "Verificando…" : "Ingresar"}
      </button>
    </form>
  );
}
