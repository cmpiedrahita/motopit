"use client";
// HU-01: registro del domiciliario con su moto. HU-18: crea su PIN y queda con la sesión iniciada.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Icono } from "@/components/Icono";
import { useSesion } from "@/components/SesionProvider";
import { Aviso, Campo, ErrorGeneral, Placa } from "@/components/ui";
import { pedir } from "@/lib/cliente";
import { normalizarPlaca, PLACA_MOTO } from "@/lib/registro";
import type { Errores } from "@/lib/validacion";

const MARCAS = ["AKT", "Bajaj", "Honda", "Yamaha", "Suzuki", "TVS", "Hero", "Kymco", "Victory", "KTM"];

export default function Registro() {
  const router = useRouter();
  const { domiciliarioId, refrescar } = useSesion();
  const [form, setForm] = useState({ nombre: "", celular: "", placa: "", marca: "", km: "", pin: "", confirmarPin: "" });
  const [registrado, setRegistrado] = useState(false);
  const [errores, setErrores] = useState<Errores>({});
  const [enviando, setEnviando] = useState(false);

  const cambiar = (campo: keyof typeof form) => (e: { target: { value: string } }) => {
    setForm((f) => ({ ...f, [campo]: e.target.value }));
    // Al corregir un campo se quita su error.
    setErrores((actuales) => {
      const resto = { ...actuales };
      delete resto[campo];
      return resto;
    });
  };

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    const r = await pedir<{ id: string }>("/api/domiciliarios", { metodo: "POST", cuerpo: form });
    setEnviando(false);
    if (!r.ok) return setErrores(r.errores);
    // El servidor ya dejó la cookie de sesión; se actualiza el estado de la app.
    setRegistrado(true);
    await refrescar();
    // Siguiente paso natural: elegir el plan.
    router.push("/planes?bienvenida=1");
  }

  if (domiciliarioId && !registrado) {
    return (
      <Aviso tipo="info" titulo="Ya estás registrado">
        <p>Ya tienes la sesión iniciada con tu moto en MotoPit.</p>
        <Link className="boton pequeno" href="/">
          Ir a mi panel
        </Link>
      </Aviso>
    );
  }

  const campo = (nombre: keyof typeof form) => ({
    id: nombre,
    value: form[nombre],
    onChange: cambiar(nombre),
    "aria-invalid": !!errores[nombre],
    "aria-describedby": errores[nombre] ? `${nombre}-error` : undefined,
  });

  return (
    <>
      <Link href="/" className="enlace fila-inicio" style={{ gap: 4 }}>
        <Icono nombre="atras" tamano={18} /> Volver
      </Link>
      <h1 style={{ marginTop: 16 }}>Registra tu moto</h1>
      <p className="sub">Toma menos de un minuto. Con estos datos el mecánico sabe qué moto va a atender.</p>

      <form className="formulario" onSubmit={enviar} noValidate>
        <ErrorGeneral mensaje={errores.general} />

        <p className="etiqueta-seccion" style={{ margin: "4px 0 -6px" }}>
          Tus datos
        </p>
        <Campo id="nombre" etiqueta="Nombre completo" error={errores.nombre}>
          <input {...campo("nombre")} autoComplete="name" placeholder="Ej. Andrea López" />
        </Campo>
        <Campo id="celular" etiqueta="Celular" error={errores.celular} ayuda="10 dígitos. Con él y tu PIN vuelves a entrar.">
          <input {...campo("celular")} type="tel" inputMode="numeric" autoComplete="tel" placeholder="300 123 4567" />
        </Campo>

        <p className="etiqueta-seccion" style={{ margin: "12px 0 -6px" }}>
          Tu moto
        </p>
        <div className="tarjeta" style={{ display: "grid", placeItems: "center", padding: 20, background: "var(--superficie-2)" }}>
          <Placa placa={normalizarPlaca(form.placa).slice(0, 6)} lista={PLACA_MOTO.test(normalizarPlaca(form.placa))} />
        </div>
        <Campo id="placa" etiqueta="Placa" error={errores.placa} ayuda="Formato de moto: 3 letras, 2 números y 1 letra.">
          <input
            {...campo("placa")}
            onChange={(e) => cambiar("placa")({ target: { value: normalizarPlaca(e.target.value) } })}
            maxLength={6}
            autoCapitalize="characters"
            placeholder="ABC12D"
            style={{ textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}
          />
        </Campo>
        <Campo id="marca" etiqueta="Marca" error={errores.marca}>
          <input {...campo("marca")} list="marcas" placeholder="Ej. Yamaha" />
          <datalist id="marcas">
            {MARCAS.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
        </Campo>
        <Campo id="km" etiqueta="Kilometraje actual" error={errores.km} ayuda="Míralo en el tablero de la moto.">
          <input {...campo("km")} type="number" inputMode="numeric" min={0} placeholder="Ej. 15000" />
        </Campo>

        <p className="etiqueta-seccion" style={{ margin: "12px 0 -6px" }}>
          Tu PIN
        </p>
        <div className="opciones">
          {(["pin", "confirmarPin"] as const).map((nombre) => (
            <Campo key={nombre} id={nombre} etiqueta={nombre === "pin" ? "Crea un PIN" : "Repítelo"} error={errores[nombre]}>
              <input
                {...campo(nombre)}
                onChange={(e) => cambiar(nombre)({ target: { value: e.target.value.replace(/\D/g, "") } })}
                type="password"
                inputMode="numeric"
                autoComplete="new-password"
                maxLength={4}
                placeholder="••••"
                style={{ letterSpacing: "0.5em", fontWeight: 700 }}
              />
            </Campo>
          ))}
        </div>
        <p className="ayuda" style={{ marginTop: -8 }}>
          4 números. Con tu celular y este PIN entras desde cualquier dispositivo.
        </p>

        <button className="boton" disabled={enviando} style={{ marginTop: 8 }}>
          {enviando ? "Registrando…" : "Registrarme"}
        </button>
        <p className="meta" style={{ textAlign: "center", margin: 0 }}>
          ¿Ya tienes cuenta?{" "}
          <Link className="enlace" href="/ingresar">
            Ingresa con tu celular
          </Link>
        </p>
      </form>
    </>
  );
}
